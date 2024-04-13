import { Content } from "@/content";
import { HttpHeader, HttpHeaders, PlainHttpHeaders } from "@tomasjs/core/http";
import { ServerResponse } from "http";

export class ResponseWriter {
  constructor(private readonly res: ServerResponse) {}

  withStatus(status: number | null): this {
    if (status === null) {
      return this;
    }

    this.res.statusCode = status;
    return this;
  }

  withHeaders(headers: HttpHeader[] | PlainHttpHeaders | HttpHeaders | null): this {
    if (headers === null) {
      return this;
    }

    if (headers instanceof HttpHeaders) {
      return this.withHeadersPlain(headers.toPlain());
    }

    if (Array.isArray(headers)) {
      return this.withHeadersArray(headers);
    }

    return this.withHeadersPlain(headers);
  }

  private withHeadersPlain(headers: PlainHttpHeaders): this {
    const headersArray: HttpHeader[] = Object.keys(headers).map((key) => ({
      key,
      value: headers[key],
    }));

    return this.withHeadersArray(headersArray);
  }

  private withHeadersArray(headers: HttpHeader[]): this {
    for (const header of headers) {
      this.res.setHeader(header.key, header.value);
    }

    return this;
  }

  withContent(content: Content<unknown> | null): this {
    if (content === null) {
      return this;
    }

    this.withHeaders({ "content-type": content.type });
    this.res.write(content.data);
    return this;
  }

  send(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.res.end(() => resolve());
    });
  }
}
