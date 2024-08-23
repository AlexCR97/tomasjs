import { IServiceProvider } from "@tomasjs/core/dependency-injection";
import { HttpMethod, IHttpContent, PlainHttpHeaders } from "@tomasjs/core/http";
import { IUser, IUserReader, UserReader } from "@/auth";
import {
  IQueryParams,
  IRequestContext as ServerRequestContext,
  IRequestContextReader as ServerRequestContextReader,
} from "@/server";

export interface IRequestContext extends ServerRequestContext {
  readonly services: IServiceProvider;
}

export interface IRequestContextReader extends ServerRequestContextReader {
  readonly services: IServiceProvider; // TODO Remove this
}

export class RequestContext implements IRequestContext {
  constructor(
    readonly method: HttpMethod,
    readonly url: string,
    readonly path: string,
    readonly headers: Readonly<PlainHttpHeaders>,
    readonly query: IQueryParams,
    readonly body: IHttpContent<unknown>,
    readonly user: IUser,
    readonly services: IServiceProvider
  ) {}

  static from(context: ServerRequestContext, services: IServiceProvider): RequestContext {
    return new RequestContext(
      context.method,
      context.url,
      context.path,
      context.headers,
      context.query,
      context.body,
      context.user,
      services
    );
  }
}

export class RequestContextReader implements IRequestContextReader {
  constructor(
    readonly method: HttpMethod,
    readonly url: string,
    readonly path: string,
    readonly headers: Readonly<PlainHttpHeaders>,
    readonly query: IQueryParams,
    readonly body: IHttpContent<unknown>,
    readonly user: IUserReader,
    readonly services: IServiceProvider
  ) {}

  static from(
    context: ServerRequestContextReader,
    services: IServiceProvider
  ): RequestContextReader {
    return new RequestContextReader(
      context.method,
      context.url,
      context.path,
      context.headers,
      context.query,
      context.body,
      context.user,
      services
    );
  }
}
