import {
  fixture,
  assert,
  html
} from '@open-wc/testing';
import * as sinon from 'sinon/pkg/sinon-esm.js';
import '../file-reader.js';

describe('<file-reader>', function() {
  async function basicFixture() {
    return await fixture(html `
      <file-reader></file-reader>
    `);
  }

  async function manualFixture(blob) {
    return await fixture(html`
      <file-reader
        .blob="${blob}"
        readas="text"></file-reader>
    `);
  }

  async function autoFixture(blob, as) {
    return await fixture(html`
      <file-reader
        .blob="${blob}"
        .readAs="${as}"
        auto></file-reader>
    `);
  }

  [
    ['progress', true],
    ['error', true],
    ['loading', true],
    ['loaded', true],
  ].forEach(([property, value]) => {
    const eventType = `on${property}`;
    const setter = `_${property}`;
    describe(eventType, () => {
      let element;
      beforeEach(async () => {
        element = await basicFixture();
      });

      it('Getter returns previously registered handler', () => {
        assert.isUndefined(element[eventType]);
        const f = () => {};
        element[eventType] = f;
        assert.isTrue(element[eventType] === f);
      });

      it('Calls registered function', () => {
        let called = false;
        const f = () => {
          called = true;
        };
        element[eventType] = f;
        element[setter] = value;
        element[eventType] = null;
        assert.isTrue(called);
      });

      it('Unregisteres old function', () => {
        let called1 = false;
        let called2 = false;
        const f1 = () => {
          called1 = true;
        };
        const f2 = () => {
          called2 = true;
        };
        element[eventType] = f1;
        element[eventType] = f2;
        element[setter] = value;
        element[eventType] = null;
        assert.isFalse(called1);
        assert.isTrue(called2);
      });
    });
  });

  [
    'read',
    'abort'
  ].forEach((property) => {
    const eventType = `on${property}`;
    describe(eventType, () => {
      let element;
      beforeEach(async () => {
        element = await basicFixture();
      });

      it('Getter returns previously registered handler', () => {
        assert.isUndefined(element[eventType]);
        const f = () => {};
        element[eventType] = f;
        assert.isTrue(element[eventType] === f);
      });

      it('Calls registered function', () => {
        let called = false;
        const f = () => {
          called = true;
        };
        element[eventType] = f;
        element.dispatchEvent(new CustomEvent(property));
        element[eventType] = null;
        assert.isTrue(called);
      });

      it('Unregisteres old function', () => {
        let called1 = false;
        let called2 = false;
        const f1 = () => {
          called1 = true;
        };
        const f2 = () => {
          called2 = true;
        };
        element[eventType] = f1;
        element[eventType] = f2;
        element.dispatchEvent(new CustomEvent(property));
        element[eventType] = null;
        assert.isFalse(called1);
        assert.isTrue(called2);
      });
    });
  });

  describe('reading a file', () => {
    let blob;
    let debug;
    beforeEach(() => {
      debug = JSON.stringify({
        hello: 'world'
      }, null, 2);
      blob = new Blob([debug], {
        type: 'application/json'
      });
    });

    async function untilRead(element) {
      return new Promise((resolve) => {
        element.addEventListener('read', function f(e) {
          element.removeEventListener('read', f);
          resolve(e.detail.result);
        });
      });
    }

    it('reads a file', async () => {
      const element = await manualFixture(blob);
      element.read();
      const result = await untilRead(element);
      assert.typeOf(result, 'string');
      assert.equal(result, debug);
    });

    it('reads a file automatically', async () => {
      const element = await autoFixture(blob, 'text');
      const result = await untilRead(element);
      assert.typeOf(result, 'string');
      assert.equal(result, debug);
    });

    it('reads as an ArrayBuffer', async () => {
      const element = await autoFixture(blob, 'array-buffer');
      const result = await untilRead(element);
      const txt = String.fromCharCode.apply(null, new Uint8Array(result));
      assert.equal(txt, debug);
    });

    it('reads as a dataURL', async () => {
      const element = await autoFixture(blob, 'data-url');
      const result = await untilRead(element);
      assert.typeOf(result, 'string');
      assert.equal(result, 'data:application/json;base64,ewogICJoZWxsbyI6ICJ3b3JsZCIKfQ==');
    });

    it('sets progress', async () => {
      const element = await autoFixture(blob, 'text');
      await untilRead(element);
      assert.equal(element.progress, 1);
    });

    it('ignores when unsupported type', async () => {
      const element = await autoFixture(blob, 'unsupported');
      assert.equal(element._reader, null);
    });
  });

  describe('_readError()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
      element._error = false;
      element._loading = true;
      element._loaded = false;
      element._readError();
    });

    it('sets error', () => {
      assert.isTrue(element.error);
    });

    it('sets loading', () => {
      assert.isFalse(element.loading);
    });

    it('sets loaded', () => {
      assert.isTrue(element.loaded);
    });
  });

  describe('_readResult()', () => {
    let element;
    let e;
    beforeEach(async () => {
      element = await basicFixture();
      element._loading = true;
      element._loaded = false;
      e = {
        target: {
          result: 'test'
        }
      };
    });

    it('error is not set', () => {
      element._readResult(e);
      assert.isFalse(element.error);
    });

    it('sets loading', () => {
      element._readResult(e);
      assert.isFalse(element.loading);
    });

    it('sets loaded', () => {
      element._readResult(e);
      assert.isTrue(element.loaded);
    });

    it('dispatches read event', () => {
      const spy = sinon.spy();
      element.addEventListener('read', spy);
      element._readResult(e);
      assert.isTrue(spy.called, 'event is called');
      assert.equal(spy.args[0][0].detail.result, 'test', 'value is set');
    });
  });

  describe('_readAbort()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
      element._loading = true;
      element._loaded = true;
    });

    it('error is not set', () => {
      element._readAbort();
      assert.isFalse(element.error);
    });

    it('sets loading', () => {
      element._readAbort();
      assert.isFalse(element.loading);
    });

    it('sets loaded', () => {
      element._readAbort();
      assert.isFalse(element.loaded);
    });

    it('dispatches abort event', () => {
      const spy = sinon.spy();
      element.addEventListener('abort', spy);
      element._readAbort();
      assert.isTrue(spy.called, 'event is called');
    });
  });

  describe('abort()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('removes the reader', () => {
      element._reader = new FileReader();
      element.abort();
      assert.equal(element._reader, null);
    });

    it('does nothing when no reader', () => {
      element.abort();
      assert.isUndefined(element._reader);
    });
  });

  describe('a11y', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('is accessible', async () => {
      await assert.isAccessible(element);
    });
  });
});
