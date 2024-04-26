import { HttpHeader, HttpHeaders, HttpMethod, PlainHttpHeaders } from "@tomasjs/core/http";
import { IQueryParams } from "./QueryParams";
import { IRouteParams } from "./RouteParams";
import { Content } from "@/content";
import { IRequestContextReader, RequestContext } from "./RequestContext";
import { UrlParser } from "./UrlParser";
import { AuthenticationPolicy, AuthorizationPolicy, IUserReader } from "@/auth";
import { Middleware } from "./Middleware";
import { Interceptor } from "./Interceptor";
import { Guard } from "./Guard";

export type Endpoint = {
  method: HttpMethod;
  path: string;
  handler: EndpointHandler;
  options?: EndpointOptions;
};

export type EndpointHandler = (
  context: IEndpointContext
) => EndpointResponse | Promise<EndpointResponse>;

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

  static from(endpoint: Endpoint, req: RequestContext): EndpointContext {
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

export class EndpointResponse {
  readonly status: number | null;
  readonly content: Content<unknown> | null;
  readonly headers: HttpHeader[] | PlainHttpHeaders | HttpHeaders | null;

  constructor(options?: EndpointResponseOptions) {
    this.status = options?.status ?? null;
    this.content = options?.content ?? null;
    this.headers = options?.headers ?? null;
  }
}

export type EndpointResponseOptions = {
  status?: number;
  content?: Content<unknown>;
  headers?: HttpHeader[] | PlainHttpHeaders | HttpHeaders;
};

export type EndpointOptions = {
  middlewares?: Middleware[];
  interceptors?: Interceptor[];
  guards?: Guard[];
  authentication?: AuthenticationPolicy;
  authorization?: AuthorizationPolicy;
};

export function isEndpoint(obj: any): obj is Endpoint {
  if (obj === null || obj === undefined) {
    return false;
  }

  const method = obj[<keyof Endpoint>"method"];
  const path = obj[<keyof Endpoint>"path"];
  const handler = obj[<keyof Endpoint>"handler"];
  return typeof method === "string" && typeof path === "string" && typeof handler === "function";
}
