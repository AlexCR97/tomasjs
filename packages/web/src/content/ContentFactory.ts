import { IncomingMessage } from "http";
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

  static async from(req: IncomingMessage): Promise<ContentFactory> {
    const contentType = this.getContentType(req);
    const data = await this.readData(req);
    return new ContentFactory(contentType, data);
  }

  private static getContentType(req: IncomingMessage): ContentType {
    const contentType = req.headers["content-type"];
    return contentType === undefined ? "application/octet-stream" : (contentType as ContentType);
  }

  private static async readData(req: IncomingMessage): Promise<Buffer> {
    return new Promise((resolve) => {
      const parts: Uint8Array[] = [];

      req.on("data", (bytes: Uint8Array) => {
        parts.push(bytes);
      });

      req.on("end", () => {
        const buffer = Buffer.concat(parts);
        return resolve(buffer);
      });
    });
  }
}
