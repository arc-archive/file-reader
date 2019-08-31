import { LitElement } from 'lit-element';
/**
 * `file-reader`
 *
 * `file-reader` is an element for read files in a web browser.
 *
 * The file can be any sub-class of Blob class. That mean it can read Blobs, File objects etc.
 * The `file reader` element don't have it's own UI. It's only a helper element to us in your app's logic.
 *
 * Example:
 *
 * ```html
 * <file-reader
 *  .blob="${this.myFile}"
 *  readAs="dataURL"
 *  @read="{this._readHandler}" auto></file-reader>
 * ```
 *
 * @customElement
 * @memberof LogicElements
 */
class FileReaderComponent extends LitElement {
  static get properties() {
    return {
      /**
       * A Blob to read. File object (the one you can get from the `<input type="file">`)
       * is a sub type of Blob.
       *
       * @type {Blob}
       */
      blob: { type: Object },
      /**
       * Automatically read file after setting up `blob` attribute.
       * If the value of this attribute is `false` you need to call `read()` manually.
       */
      auto: { type: Boolean },
      /**
       * Sets how the input data should be read.
       * Result format depends on this setting.
       * Possible values are: `array-buffer`, `data-url`, `text`.
       */
      readAs: { type: String },
      /**
       * A file encoding. Used when reading file as text.
       * If not provided UTF-8 will be assumed.
       */
      encoding: { type: String },
      /**
       * Current reader.
       */
      _reader: FileReader
    };
  }
  /**
   * @return {Boolean} Read-only value that is true when the data is read.
   */
  get loaded() {
    return this._loaded;
  }

  get _loaded() {
    return this.__loaded;
  }

  set _loaded(value) {
    const old = this.__loaded;
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this.__loaded = value;
    this.dispatchEvent(new CustomEvent('loaded', {
      detail: {
        value
      }
    }));
  }
  /**
   * @return {Boolean} Read-only value that tracks the loading state of the data.
   */
  get loading() {
    return this._loading || false;
  }

  get _loading() {
    return this.__loading;
  }

  set _loading(value) {
    const old = this.__loading;
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this.__loading = value;
    this.dispatchEvent(new CustomEvent('loading', {
      detail: {
        value
      }
    }));
  }
  /**
   * @return {Boolean} Read-only value that indicates that the last set `blob` failed to load.
   */
  get error() {
    return this._error || false;
  }

  get _error() {
    return this.__error;
  }

  set _error(value) {
    const old = this.__error;
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this.__error = value;
    this.dispatchEvent(new CustomEvent('error', {
      detail: {
        value
      }
    }));
  }
  /**
   * This is set only if the browser is able to determine length of the file.
   * The value is in range from 0 to 1.
   * @return {Number} Current progress of file read.
   */
  get progress() {
    return this._progress || 0;
  }

  get _progress() {
    return this.__progress;
  }

  set _progress(value) {
    const old = this.__progress;
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this.__progress = value;
    this.dispatchEvent(new CustomEvent('progress', {
      detail: {
        value
      }
    }));
  }

  get readAs() {
    return this._readAs;
  }

  set readAs(value) {
    const old = this._readAs;
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this._readAs = value;
    this._autoChanged();
  }

  get blob() {
    return this._blob;
  }

  set blob(value) {
    const old = this._blob;
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this._blob = value;
    this._autoChanged();
  }

  get auto() {
    return this._auto;
  }

  set auto(value) {
    const old = this._auto;
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this._auto = value;
    this._autoChanged();
  }

  /**
   * @return {Function} Previously registered handler for `progress` event
   */
  get onprogress() {
    return this._onprogress;
  }
  /**
   * Registers a callback function for `progress` event
   * @param {Function} value A callback to register. Pass `null` or `undefined`
   * to clear the listener.
   */
  set onprogress(value) {
    this._registerCallback('progress', value);
  }

  /**
   * @return {Function} Previously registered handler for `error` event
   */
  get onerror() {
    return this._onerror;
  }
  /**
   * Registers a callback function for `error` event
   * @param {Function} value A callback to register. Pass `null` or `undefined`
   * to clear the listener.
   */
  set onerror(value) {
    this._registerCallback('error', value);
  }

  /**
   * @return {Function} Previously registered handler for `loading` event
   */
  get onloading() {
    return this._onloading;
  }
  /**
   * Registers a callback function for `loading` event
   * @param {Function} value A callback to register. Pass `null` or `undefined`
   * to clear the listener.
   */
  set onloading(value) {
    this._registerCallback('loading', value);
  }

  /**
   * @return {Function} Previously registered handler for `loaded` event
   */
  get onloaded() {
    return this._onloaded;
  }
  /**
   * Registers a callback function for `loaded` event
   * @param {Function} value A callback to register. Pass `null` or `undefined`
   * to clear the listener.
   */
  set onloaded(value) {
    this._registerCallback('loaded', value);
  }

  /**
   * @return {Function} Previously registered handler for `read` event
   */
  get onread() {
    return this._onread;
  }
  /**
   * Registers a callback function for `read` event
   * @param {Function} value A callback to register. Pass `null` or `undefined`
   * to clear the listener.
   */
  set onread(value) {
    this._registerCallback('read', value);
  }

  /**
   * @return {Function} Previously registered handler for `abort` event
   */
  get onabort() {
    return this._onabort;
  }
  /**
   * Registers a callback function for `abort` event
   * @param {Function} value A callback to register. Pass `null` or `undefined`
   * to clear the listener.
   */
  set onabort(value) {
    this._registerCallback('abort', value);
  }

  constructor() {
    super();
    this._readProgress = this._readProgress.bind(this);
    this._readAbort = this._readAbort.bind(this);
    this._readResult = this._readResult.bind(this);
    this._readError = this._readError.bind(this);

    this.readAs = 'text';
  }

  connectedCallback() {
    if (super.connectedCallback) {
      super.connectedCallback();
    }
    this.setAttribute('aria-hidden', 'true');
  }

  disconnectedCallback() {
    if (super.disconnectedCallback) {
      super.disconnectedCallback();
    }
    if (this._reader) {
      if (!this._loaded) {
        this.abort();
      }
      this._reader = null;
    }
  }

  /**
   * Registers an event handler for given type
   * @param {String} eventType Event type (name)
   * @param {Function} value The handler to register
   */
  _registerCallback(eventType, value) {
    const key = `_on${eventType}`;
    if (this[key]) {
      this.removeEventListener(eventType, this[key]);
    }
    if (typeof value !== 'function') {
      this[key] = null;
      return;
    }
    this[key] = value;
    this.addEventListener(eventType, value);
  }

  /**
   * Supports auto read function.
   * Called when one of `auto`, `blob` or `readAs` change and when all of them are set.
   */
  _autoChanged() {
    const { auto, blob } = this;
    if (!auto || !blob) {
      return;
    }
    this.read();
  }

  /**
   * Read the blob.
   */
  read() {
    this.abort();
    this._loaded = false;
    this._loading = true;
    this._error = false;
    this._progress = 0;
    this._read();
  }
  /** Performs a read operation. */
  _read() {
    const reader = new FileReader();
    reader.addEventListener('load', this._readResult);
    reader.addEventListener('error', this._readError);
    reader.addEventListener('progress', this._readProgress);
    reader.addEventListener('abort', this._readAbort);
    switch (this.readAs) {
      case 'array-buffer':
        reader.readAsArrayBuffer(this.blob);
        break;
      case 'data-url':
        reader.readAsDataURL(this.blob);
        break;
      case 'text':
        reader.readAsText(this.blob, this.encoding);
        break;
      default:
        return;
    }
    this._reader = reader;
  }
  /**
   * Error event handler
   */
  _readError() {
    this._error = true;
    this._loading = false;
    this._loaded = true;
  }
  /**
   * Load event handler
   * @param {Event} e
   */
  _readResult(e) {
    this._loading = false;
    this._loaded = true;
    this.dispatchEvent(new CustomEvent('read', {
      detail: {
        result: e.target.result
      }
    }));
  }
  /** Abort event handler */
  _readAbort() {
    this._loading = false;
    this._loaded = false;
    this.dispatchEvent(new CustomEvent('abort'));
  }
  /**
   * Progress event handler.
   * @param {Event} e
   */
  _readProgress(e) {
    if (e.lengthComputable) {
      const percentComplete = e.loaded / e.total;
      this._progress = percentComplete;
    }
  }
  /**
   * Aborts current operation.
   * If the reader is not working this method do nothing.
   * Note that the `file-abort` event is fired when this method is called.
   */
  abort() {
    if (this._reader) {
      this._reader.abort();
      this._reader.removeEventListener('load', this._readResult);
      this._reader.removeEventListener('error', this._readError);
      this._reader.removeEventListener('progress', this._readProgress);
      this._reader.removeEventListener('abort', this._readAbort);
      this._reader = null;
    }
  }
  /**
   * Fired when read operation failed.
   *
   * @event file-error
   * @param {Event} error An event thrown by the reader.
   */
  /**
   * Fired when read operation finish.
   * The format of the data depends on which of the methods was used to initiate
   * the read operation - see `readAs` for more information.
   *
   * @event file-read
   * @param {String|ArrayBuffer} result A string or an ArrayBuffer which depends on `readAs`.
   */
}
window.customElements.define('file-reader', FileReaderComponent);
