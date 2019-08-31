[![Build Status](https://travis-ci.org/advanced-rest-client/file-reader.svg?branch=stage)](https://travis-ci.org/advanced-rest-client/file-reader)
[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/advanced-rest-client/file-reader)
[![Published on NPM](https://img.shields.io/npm/v/@advanced-rest-client/file-reader.svg)](https://www.npmjs.com/package/@advanced-rest-client/file-reader)

# file-reader

A web component that reads files.

## Usage

### Installation
```
npm install --save @advanced-rest-client/file-reader
```

### In an html file

```html
<html>
  <head>
    <script type="module">
      import '@advanced-rest-client/file-reader/file-reader.js';
    </script>
  </head>
  <body>
    <file-reader readas="array-buffer" auto></file-reader>

    <script>
    {
      const reader = document.querySelector('file-reader');
      reader.onprogress = (e) => {
        console.log(e.target.progress);
      };
      reader.onread = (e) => {
        console.log(e.detail.result);
      };
      reader.onerror = () => {
        console.log('file is corrupted');
      };
      reader.blob = new Blob(['some text'], {
        type: 'plain/text'
      });
    }
    </script>
  </body>
</html>
```

### In a LitElement

```js
import { LitElement, html } from 'lit-element';
import '@advanced-rest-client/file-reader/file-reader.js';

class SampleElement extends PolymerElement {
  render() {
    return html`
    <file-reader
      readas="text"
      @progress="${this._progressHandler}"
      @read="${this._readHandler}"
      @error="${this._errorHandler}"></file-reader>
    `;
  }

  _progressHandler(e) {
    ...
  }

  _readHandler(e) {
    ...
  }

  _errorHandler() {
    ...
  }
}
customElements.define('sample-element', SampleElement);
```

## Development

```sh
git clone https://github.com/advanced-rest-client/file-reader
cd file-reader
npm install
```

### Running the tests
```sh
npm test
```

## API components

This components is a part of [API components ecosystem](https://elements.advancedrestclient.com/)
