import { Content } from "./Content";
import { ContentType } from "./ContentType";
import { HtmlContent } from "./HtmlContent";
import { JsonContent } from "./JsonContent";
import { PlainTextContent } from "./PlainTextContent";
import { ProblemDetailsContent } from "./ProblemDetailsContent";
import { RawContent } from "./RawContent";

export class ContentFactory {
  constructor(private readonly contentType: ContentType, private readonly data: Buffer) {}

  createContent(): Content<unknown> {
    if (this.contentType === "text/html") {
      return new HtmlContent(this.data);
    }

    if (this.contentType === "application/json") {
      return new JsonContent(this.data);
    }

    if (this.contentType === "text/plain") {
      return new PlainTextContent(this.data);
    }

    if (this.contentType === "application/problem+json") {
      return new ProblemDetailsContent(this.data);
    }

    return new RawContent(this.data);
  }
}
