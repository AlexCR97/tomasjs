import {
  HttpContentType,
  IHttpContent,
  PlainTextContent,
  HtmlContent,
  JsonContent,
  RawContent,
} from "./HttpContent";
import { ProblemDetailsContent } from "./ProblemDetailsContent";

export interface IHttpContentFactory {
  from(contentType: HttpContentType, data: Buffer): IHttpContent<unknown>;
}

export const HttpContentFactory: IHttpContentFactory = {
  from(contentType: HttpContentType, data: Buffer): IHttpContent<unknown> {
    if (contentType.includes("text/plain")) {
      return new PlainTextContent(data);
    }

    if (contentType.includes("text/html")) {
      return new HtmlContent(data);
    }

    if (contentType.includes("application/json")) {
      return new JsonContent(data);
    }

    if (contentType.includes("application/problem+json")) {
      return new ProblemDetailsContent(data);
    }

    return new RawContent(contentType, data);
  },
} as const;
