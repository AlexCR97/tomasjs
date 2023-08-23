export class FormFile {
  constructor(
    /** The name of the file */
    readonly name: string,

    /** Encoding type of the file */
    readonly encoding: string,

    /** The mimetype of your file */
    readonly mimetype: string,

    /** A buffer representation of the file. */
    readonly data: Buffer,

    /** A boolean that represents if the file is over the size limit */
    readonly truncated: boolean,

    /** The uploaded size in bytes */
    readonly size: number,

    /** The MD5 checksum of the uploaded file */
    readonly md5: string
  ) {}
}
