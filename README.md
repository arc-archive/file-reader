
`file-reader` is an element for read files in a web browser.
The file can be any sub-class of Blob class. That mean it can read Blobs, File objects etc.

The `file reader` element don't have it's own UI. It's only a helper element to us in your
app's logic.


Example:

<file-reader blob="[[myFile]]" readAs="dataURL" on-file-read="myFileAsURL" auto></file-reader>



### Events
| Name | Description | Params |
| --- | --- | --- |
| file-abort | Fired when read operation has been aborted by calling `abort` method. | __none__ |
| file-error | Fired when read operation failed. | error **Event** - An event thrown by the reader. |
| file-read | Fired when read operation finish. The format of the data depends on which of the methods was used to initiate the read operation - see `readAs` for more information. | result **(String&#124;ArrayBuffer)** - A string or an ArrayBuffer which depends on `readAs`. |
