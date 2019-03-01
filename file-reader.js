import {PolymerElement} from '@polymer/polymer/polymer-element.js';
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
 * <file-reader blob="[[myFile]]" readAs="dataURL" on-file-read="myFileAsURL" auto></file-reader>
 * ```
 *
 * @customElement
 * @polymer
 * @memberof LogicElements
 */
class FileReaderComponent extends PolymerElement {
  static get properties() {
    return {
      /**
       * A Blob to read. File object (the one you can get from the `<input type="file">`)
       * is a sub type of Blob.
       *
       * @type {Blob}
       */
      blob: Object,
      /**
       * Automatically read file after setting up `blob` attribute.
       * If the value of this attribute is `false` you need to call `read()` manually.
       */
      auto: {
        type: Boolean,
        value: false
      },
      /**
       * Sets how the input data should be read.
       * Result format depends on this setting.
       * Possible values are: `arrayBuffer`, `binaryString`, `dataURL`, `text`.
       */
      readAs: {
        type: String,
        value: 'text'
      },
      /**
       * Read-only value that is true when the data is read.
       */
      loaded: {
        notify: true,
        readOnly: true,
        type: Boolean
      },
      /**
       * Read-only value that tracks the loading state of the data.
       */
      loading: {
        notify: true,
        readOnly: true,
        type: Boolean
      },
      /**
       * Read-only value that indicates that the last set `blob` failed to load.
       */
      error: {
        notify: true,
        readOnly: true,
        type: Boolean
      },
      /**
       * Current progress of file read.
       * This is set only if the browser is able to determine length of the file.
       * The value is in range from 0 to 1.
       */
      progress: {
        type: Number,
        readOnly: true,
        notify: true,
        value: 0
      },
      /**
       * A file encoding. Used when reading file as text.
       * If not provided UTF-8 will be assumed.
       */
      encoding: String,
      /**
       * Current reader.
       */
      _reader: FileReader
    };
  }

  static get observers() {
    return [
      '_autoChanged(auto, blob, readAs)'
    ];
  }

  constructor() {
    super();
    this._readProgress = this._readProgress.bind(this);
    this._readAbort = this._readAbort.bind(this);
    this._readResult = this._readResult.bind(this);
    this._readError = this._readError.bind(this);
  }

  /**
   * Supports auto read function.
   * Called when one of `auto`, `blob` or `readAs` change and when all of them are set.
   * @param {Boolean} auto
   * @param {Blob} blob
   */
  _autoChanged(auto, blob) {
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
    this._setLoaded(false);
    this._setLoading(true);
    this._setError(false);
    this._setProgress(0);
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
      case 'binary-string':
        reader.readAsBinaryString(this.blob);
        break;
      case 'data-url':
        reader.readAsDataURL(this.blob);
        break;
      case 'text':
        reader.readAsText(this.blob, this.encoding);
        break;
      default:
        throw new Error('The readAs attribute must be set.');
    }
    this._reader = reader;
  }
  /**
   * Error event handler
   * @param {Event} e
   */
  _readError(e) {
    this._setError(true);
    this._setLoading(false);
    this._setLoaded(true);
    this.dispatchEvent(new CustomEvent('file-error', {
      detail: {
        error: e
      }
    }));
  }
  /**
   * Load event handler
   * @param {Event} e
   */
  _readResult(e) {
    this._setLoaded(true);
    this._setLoading(false);
    this.dispatchEvent(new CustomEvent('file-read', {
      detail: {
        result: e.target.result
      }
    }));
  }
  /** Abort event handler */
  _readAbort() {
    this._setLoading(false);
    this._setLoaded(false);
    this.dispatchEvent(new CustomEvent('file-abort'));
  }
  /**
   * Progress event handler.
   * @param {Event} e
   */
  _readProgress(e) {
    if (e.lengthComputable) {
      let percentComplete = e.loaded / e.total;
      this._setProgress(percentComplete);
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
      this._reader = undefined;
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
