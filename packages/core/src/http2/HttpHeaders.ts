import { InvalidOperationError } from "@/errors";

export type HttpHeader = { key: string; value: HttpHeaderValue };

export function isHttpHeader(obj: any): obj is HttpHeader {
  if (obj === undefined || obj === null) {
    return false;
  }

  if (typeof obj !== "object") {
    return false;
  }

  const hasKey =
    Object.hasOwn(obj, <keyof HttpHeader>"key") && typeof obj[<keyof HttpHeader>"key"] === "string";

  const hasValue =
    Object.hasOwn(obj, <keyof HttpHeader>"value") &&
    isHttpHeaderValue(obj[<keyof HttpHeader>"value"]);

  return hasKey && hasValue;
}

export type HttpHeaderValue = string | readonly string[];

export function isHttpHeaderValue(obj: any): obj is HttpHeaderValue {
  return typeof obj === "string" || Array.isArray(obj);
}

export type PlainHttpHeaders = Record<string, HttpHeaderValue>;

export function isPlainHttpHeaders(obj: any): obj is PlainHttpHeaders {
  const objProto = Object.getPrototypeOf(obj);

  if (typeof obj !== "object") {
    return false;
  }

  if (Array.isArray(obj)) {
    return false;
  }

  return (
    Object.keys(obj).every((key) => typeof key === "string") &&
    Object.values(obj).every((value) => isHttpHeaderValue(value))
  );
}

export interface IHttpHeaders {
  add(header: HttpHeader): this;
  add(header: PlainHttpHeaders): this;
  add(headers: HttpHeader[]): this;
  add(key: string, value: HttpHeaderValue): this;
  find(key: string): HttpHeader | null;
  includes(key: string): boolean;
  remove(key: string): boolean;
  toPlain(): PlainHttpHeaders;
}

export function isIHttpHeaders(obj: unknown): obj is IHttpHeaders {
  if (obj === undefined || obj === null) {
    return false;
  }

  return (
    hasMethod(obj, "add") &&
    hasMethod(obj, "find") &&
    hasMethod(obj, "includes") &&
    hasMethod(obj, "remove") &&
    hasMethod(obj, "toPlain")
  );

  function hasMethod(obj: object, methodName: keyof IHttpHeaders): boolean {
    const objProto = Object.getPrototypeOf(obj);
    const hasMethod = Object.hasOwn(objProto, methodName);
    const methodInstance = (obj as any)[methodName];
    return hasMethod && typeof methodInstance === "function";
  }
}

export class HttpHeaders implements IHttpHeaders {
  private readonly headers: HttpHeader[] = [];

  add(header: HttpHeader): this;
  add(header: PlainHttpHeaders): this;
  add(headers: HttpHeader[]): this;
  add(key: string, value: HttpHeaderValue): this;
  add(...args: any[]): this {
    if (args.length === 1) {
      if (Array.isArray(args[0])) {
        const [header] = args;
        return this.addHeaders(header);
      }

      if (isHttpHeader(args[0])) {
        const header: HttpHeader = args[0];
        return this.addHeader(header);
      }

      if (isPlainHttpHeaders(args[0])) {
        const headers: PlainHttpHeaders = args[0];
        return this.addPlainHeaders(headers);
      }
    }

    if (args.length === 2) {
      const key: string = args[0];
      const value: HttpHeaderValue = args[1];
      return this.addHeader({ key, value });
    }

    throw new InvalidOperationError();
  }

  private addHeader(header: HttpHeader): this {
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

  private addHeaders(headers: HttpHeader[]): this {
    for (const header of headers) {
      this.addHeader(header);
    }

    return this;
  }

  private addPlainHeaders(headers: PlainHttpHeaders): this {
    for (const key in headers) {
      const value = headers[key];
      this.addHeader({ key, value });
    }

    return this;
  }

  find(key: string): HttpHeader | null {
    return (
      this.headers.find((x) => x.key.trim().toLowerCase() === key.trim().toLowerCase()) ?? null
    );
  }

  includes(key: string): boolean {
    return this.find(key) !== null;
  }

  remove(key: string): boolean {
    const header = this.find(key);

    if (header === null) {
      return false;
    }

    const index = this.headers.indexOf(header);
    this.headers.splice(index, 1);
    return true;
  }

  toPlain(): PlainHttpHeaders {
    const headers: PlainHttpHeaders = {};

    for (const { key, value } of this.headers) {
      headers[key] = value;
    }

    return headers;
  }

  static fromArray(headers: HttpHeader[]): HttpHeaders {
    const h = new HttpHeaders();

    for (const { key, value } of headers) {
      h.add(key, value);
    }

    return h;
  }

  static fromPlain(headers: PlainHttpHeaders): HttpHeaders {
    const h = new HttpHeaders();

    for (const key in headers) {
      h.add(key, headers[key]);
    }

    return h;
  }
}
