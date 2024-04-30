import { HttpHeader, HttpHeaders, HttpMethod, PlainHttpHeaders } from "@tomasjs/core/http";
import { Content } from "@/content";
import { AuthenticationPolicy, AuthorizationPolicy, IUserReader } from "@/auth";
import { Middleware } from "@/middleware";
import { Interceptor } from "@/interceptor";
import { Guard } from "@/guard";
import {
  IRequestContextReader,
  IRouteParams,
  IQueryParams,
  RequestContext,
  UrlParser,
  HttpResponse,
} from "@/server";

export type PlainEndpoint = {
  method: HttpMethod;
  path: string;
  handler: EndpointHandler;
  options?: EndpointOptions;
};

export type EndpointHandler = (context: IEndpointContext) => HttpResponse | Promise<HttpResponse>;

export interface IEndpointContext extends IRequestContextReader {
  params: IRouteParams;
}

export class EndpointContext implements IEndpointContext {
  constructor(
    readonly method: HttpMethod,
    readonly url: string,
    readonly path: string,
    readonly headers: Readonly<PlainHttpHeaders>,
    readonly params: IRouteParams,
    readonly query: IQueryParams,
    readonly body: Content<unknown>,
    readonly user: IUserReader
  ) {}

  static from(endpoint: PlainEndpoint, req: RequestContext): EndpointContext {
    const urlParser = new UrlParser(req.url);

    return new EndpointContext(
      req.method,
      req.url,
      req.path,
      req.headers,
      urlParser.routeParams(endpoint.path),
      req.query,
      req.body,
      req.user
    );
  }
}

export type EndpointOptions = {
  middlewares?: Middleware[];
  interceptors?: Interceptor[];
  guards?: Guard[];
  authentication?: AuthenticationPolicy;
  authorization?: AuthorizationPolicy;
};

export function isPlainEndpoint(obj: any): obj is PlainEndpoint {
  if (obj === null || obj === undefined) {
    return false;
  }

  const method = obj[<keyof PlainEndpoint>"method"];
  const path = obj[<keyof PlainEndpoint>"path"];
  const handler = obj[<keyof PlainEndpoint>"handler"];
  return typeof method === "string" && typeof path === "string" && typeof handler === "function";
}
