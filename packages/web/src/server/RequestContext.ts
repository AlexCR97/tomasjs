import { HttpHeader, HttpHeaders, HttpMethod, PlainHttpHeaders } from "@tomasjs/core/http";
import { IQueryParams } from "./QueryParams";
import { Content, ContentFactory } from "@/content";
import { IncomingMessage } from "http";
import { UrlParser } from "./UrlParser";
import { InvalidOperationError } from "@tomasjs/core/errors";
import { pipe } from "@tomasjs/core/system";
import { IUser, IUserReader, User, UserReader } from "@/auth";

export interface IRequestContext {
  readonly method: HttpMethod;
  readonly url: string;
  readonly path: string;
  readonly headers: Readonly<PlainHttpHeaders>;
  readonly query: IQueryParams;
  readonly body: Content<unknown>;
  readonly user: IUser;
}

export interface IRequestContextReader {
  readonly method: HttpMethod;
  readonly url: string;
  readonly path: string;
  readonly headers: Readonly<PlainHttpHeaders>;
  readonly query: IQueryParams;
  readonly body: Content<unknown>;
  readonly user: IUserReader;
}

export class RequestContext implements IRequestContext {
  constructor(
    readonly method: HttpMethod,
    readonly url: string,
    readonly path: string,
    readonly headers: Readonly<PlainHttpHeaders>,
    readonly query: IQueryParams,
    readonly body: Content<unknown>,
    readonly user: IUser
  ) {}

  static async from(req: IncomingMessage): Promise<RequestContext> {
    const urlParser = UrlParser.from(req);

    return new RequestContext(
      this.getHttpMethod(req),
      req.url ?? "/",
      urlParser.path(),
      this.getHeaders(req),
      urlParser.queryParams(),
      await this.getRequestBody(req),
      new User()
    );
  }

  private static getHttpMethod(req: IncomingMessage): HttpMethod {
    if (req.method === "GET") {
      return "get";
    }

    if (req.method === "POST") {
      return "post";
    }

    if (req.method === "PUT") {
      return "put";
    }

    if (req.method === "PATCH") {
      return "patch";
    }

    if (req.method === "DELETE") {
      return "delete";
    }

    if (req.method === "HEAD") {
      return "head";
    }

    if (req.method === "OPTIONS") {
      return "options";
    }

    throw new InvalidOperationError();
  }

  private static getHeaders(req: IncomingMessage): Readonly<PlainHttpHeaders> {
    return pipe(req.headers)
      .pipe((headers) => {
        return Object.keys(headers)
          .map((key) => <HttpHeader>{ key, value: headers[key] })
          .filter((header) => header.value !== null && header.value !== undefined);
      })
      .pipe((headers) => new HttpHeaders().add(headers).toPlain())
      .get();
  }

  private static async getRequestBody(req: IncomingMessage): Promise<Content<unknown>> {
    const factory = await ContentFactory.from(req);
    return factory.createContent();
  }
}

export class RequestContextReader implements IRequestContextReader {
  constructor(
    readonly method: HttpMethod,
    readonly url: string,
    readonly path: string,
    readonly headers: Readonly<PlainHttpHeaders>,
    readonly query: IQueryParams,
    readonly body: Content<unknown>,
    readonly user: IUserReader
  ) {}

  static from(context: IRequestContext): RequestContextReader {
    return new RequestContextReader(
      context.method,
      context.url,
      context.path,
      context.headers,
      context.query,
      context.body,
      new UserReader(context.user)
    );
  }
}
