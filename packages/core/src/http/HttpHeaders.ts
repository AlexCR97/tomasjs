import { InvalidOperationError } from "@/errors";

export type HttpHeader = { key: HttpHeaderKey; value: HttpHeaderValue };

export type HttpHeaderKey = string;

export type HttpHeaderValue = string | readonly string[];

export type PlainHttpHeaders = Record<HttpHeaderKey, HttpHeaderValue>;

export class HttpHeaders {
  private readonly headers: HttpHeader[] = [];

  add(header: HttpHeader): HttpHeaders;
  add(headers: HttpHeader[]): HttpHeaders;
  add(key: HttpHeaderKey, value: HttpHeaderValue): HttpHeaders;
  add(...args: any[]): HttpHeaders {
    if (args.length === 1) {
      if (Array.isArray(args[0])) {
        const [header] = args;
        return this.addHeaders(header);
      } else {
        const [header] = args;
        return this.addHeader(header);
      }
    }

    if (args.length === 2) {
      const [key, value] = args;
      return this.addHeader({ key, value });
    }

    throw new InvalidOperationError();
  }

  private addHeader(header: HttpHeader): HttpHeaders {
    const existingHeader = this.find(header.key);

    if (existingHeader === null) {
      this.headers.push(header);
    } else {
      if (typeof existingHeader.value === "string") {
        existingHeader.value = [existingHeader.value];
      }

      existingHeader.value = [...existingHeader.value, ...header.value];
    }

    return this;
  }

  private addHeaders(headers: HttpHeader[]): HttpHeaders {
    for (const header of headers) {
      this.addHeader(header);
    }

    return this;
  }

  find(key: HttpHeaderKey): HttpHeader | null {
    return (
      this.headers.find((x) => x.key.trim().toLowerCase() === key.trim().toLowerCase()) ?? null
    );
  }

  includes(key: HttpHeaderKey): boolean {
    return this.find(key) !== null;
  }

  remove(key: HttpHeaderKey): HttpHeaders {
    const header = this.find(key);

    if (header !== null) {
      const index = this.headers.indexOf(header);
      this.headers.splice(index, 1);
    }

    return this;
  }

  toPlain(): PlainHttpHeaders {
    const headers: PlainHttpHeaders = {};

    for (const { key, value } of this.headers) {
      headers[key] = value;
    }

    return headers;
  }
}
