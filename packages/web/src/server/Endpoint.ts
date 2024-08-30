import { HTTP_STATUS_CODES, HttpMethod, IHttpContent, PlainHttpHeaders } from "@tomasjs/core/http";
import { AuthenticationPolicyFunction, AuthorizationPolicyFunction, IUserReader } from "@/auth";
import { MiddlewareFunction } from "./Middleware";
import { InterceptorFunction } from "./Interceptor";
import { GuardFunction } from "./Guard";
import { MiddlewareAggregate } from "./MiddlewareAggregate";
import { HttpResponse } from "./HttpResponse";
import { IRequestContext, IRequestContextReader, RequestContext } from "./RequestContext";
import { IRouteParams } from "./RouteParams";
import { IQueryParams } from "./QueryParams";
import { UrlParser } from "./UrlParser";
import { IResponseWriter } from "./ResponseWriter";
import { HttpPipeline } from "./HttpPipeline";

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
    readonly body: IHttpContent<unknown>,
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
  middlewares?: MiddlewareFunction[];
  interceptors?: InterceptorFunction[];
  guards?: GuardFunction[];
  authentication?: AuthenticationPolicyFunction;
  authorization?: AuthorizationPolicyFunction;
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

export interface IEndpoint {
  use(middleware: MiddlewareFunction): this;
  useInterceptor(interceptor: InterceptorFunction): this;
  useGuard(guard: GuardFunction): this;
  useAuthentication(policy: AuthenticationPolicyFunction): this;
  useAuthorization(policy: AuthorizationPolicyFunction): this;
  toPlain(): PlainEndpoint;
}

export class Endpoint implements IEndpoint {
  private readonly middlewares: MiddlewareFunction[] = [];
  private readonly interceptors: InterceptorFunction[] = [];
  private readonly guards: GuardFunction[] = [];
  private authentication: AuthenticationPolicyFunction | undefined;
  private authorization: AuthorizationPolicyFunction | undefined;

  constructor(
    private readonly method: HttpMethod,
    private readonly path: string,
    private readonly handler: EndpointHandler
  ) {}

  static get(path: string, handler: EndpointHandler): Endpoint {
    return new Endpoint("GET", path, handler);
  }

  static post(path: string, handler: EndpointHandler): Endpoint {
    return new Endpoint("POST", path, handler);
  }

  static put(path: string, handler: EndpointHandler): Endpoint {
    return new Endpoint("PUT", path, handler);
  }

  static patch(path: string, handler: EndpointHandler): Endpoint {
    return new Endpoint("PATCH", path, handler);
  }

  static delete(path: string, handler: EndpointHandler): Endpoint {
    return new Endpoint("DELETE", path, handler);
  }

  use(middleware: MiddlewareFunction): this {
    this.middlewares.push(middleware);
    return this;
  }

  useInterceptor(interceptor: InterceptorFunction): this {
    this.interceptors.push(interceptor);
    return this;
  }

  useGuard(guard: GuardFunction): this {
    this.guards.push(guard);
    return this;
  }

  useAuthentication(policy: AuthenticationPolicyFunction): this {
    this.authentication = policy;
    return this;
  }

  useAuthorization(policy: AuthorizationPolicyFunction): this {
    this.authorization = policy;
    return this;
  }

  toPlain(): PlainEndpoint {
    return {
      method: this.method,
      path: this.path,
      handler: this.handler,
      options: {
        middlewares: this.middlewares,
        interceptors: this.interceptors,
        guards: this.guards,
        authentication: this.authentication,
        authorization: this.authorization,
      },
    };
  }
}

export function endpoints(endpoints: PlainEndpoint[]): MiddlewareFunction {
  return async ({ req, res, next }) => {
    const httpResponse = await handleRequest(req, res);

    if (httpResponse !== null) {
      res
        .withContent(httpResponse.content)
        .withHeaders(httpResponse.headers)
        .withStatus(httpResponse.status);
    }

    return await next();
  };

  async function handleRequest(
    req: IRequestContext,
    res: IResponseWriter
  ): Promise<HttpResponse | null> {
    const urlParser = new UrlParser(req.url);

    const endpoint = endpoints.find(({ method, path }) => {
      return method === req.method && urlParser.matches(path);
    });

    if (endpoint === undefined) {
      return new HttpResponse({
        status: HTTP_STATUS_CODES.notFound,
      });
    }

    const middlewareAggregate = new MiddlewareAggregate()
      .addMiddleware(...(endpoint.options?.middlewares ?? []))
      .addInterceptor(...(endpoint.options?.interceptors ?? []))
      .addGuard(...(endpoint.options?.guards ?? []));

    if (endpoint.options?.authentication) {
      middlewareAggregate.addAuthentication(endpoint.options.authentication);
    }

    if (endpoint.options?.authorization) {
      middlewareAggregate.addAuthorization(endpoint.options.authorization);
    }

    const endpointMiddlewares = middlewareAggregate.get();

    if (endpointMiddlewares.length > 0) {
      await new HttpPipeline(endpointMiddlewares).run(req, res);
    }

    if (res.sent) {
      return null;
    }

    const context = EndpointContext.from(endpoint, req);
    return await endpoint.handler(context);
  }
}
