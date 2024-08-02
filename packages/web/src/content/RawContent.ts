import { Content } from "./Content";
import { ContentType } from "./ContentType";

export class RawContent extends Content<Buffer> {
  override type: ContentType = "application/octet-stream";

  readData(): Buffer {
    return this.data;
  }
}
