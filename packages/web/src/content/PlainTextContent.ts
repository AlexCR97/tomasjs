import { Content } from "./Content";
import { ContentType } from "./ContentType";

export class PlainTextContent extends Content<string> {
  override type: ContentType = "text/plain";

  readData(): string {
    return this.data.toString();
  }

  static from(text: string): PlainTextContent {
    const data = Buffer.from(text, "utf-8");
    return new PlainTextContent(data);
  }
}
