import { Content } from "./Content";
import { ContentType } from "./ContentType";
import { PlainTextContent } from "./PlainTextContent";

export class HtmlContent extends Content<string> {
  override type: ContentType = "text/html";

  readData(): string {
    return this.data.toString();
  }

  static from(html: string): HtmlContent {
    const data = Buffer.from(html, "utf-8");
    return new PlainTextContent(data);
  }
}
