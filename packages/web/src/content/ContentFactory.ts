import {
  HtmlContent,
  HttpContentType,
  IHttpContent,
  JsonContent,
  PlainTextContent,
  RawContent,
} from "@tomasjs/core/http";
import { readToBuffer } from "@tomasjs/core/system/streams";
import { IncomingMessage } from "node:http";
import { ProblemDetailsContent } from "./ProblemDetailsContent";

export class ContentFactory {
  constructor(private readonly contentType: HttpContentType, private readonly data: Buffer) {}

  createContent(): IHttpContent<unknown> {
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

    return new RawContent(this.contentType, this.data);
  }

  static async from(req: IncomingMessage): Promise<ContentFactory> {
    const contentType = this.getContentType(req);
    const data = await readToBuffer(req);
    return new ContentFactory(contentType, data);
  }

  private static getContentType(req: IncomingMessage): HttpContentType {
    const contentType = req.headers["content-type"];
    return contentType === undefined
      ? "application/octet-stream"
      : (contentType as HttpContentType);
  }
}
