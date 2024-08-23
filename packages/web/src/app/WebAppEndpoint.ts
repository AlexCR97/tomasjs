import { IUserReader } from "@/auth";
import { hasLength, isFunction, isInRange, isNotNull } from "@/common";
import { IEndpointContext } from "@/endpoint";
import { HttpResponse, IQueryParams, IRouteParams } from "@/server";
import { IServiceProvider } from "@tomasjs/core/dependency-injection";
import { HttpMethod, IHttpContent, PlainHttpHeaders } from "@tomasjs/core/http";
import { MiddlewareFunction } from "./Middleware";
import { InterceptorFunction } from "./Interceptor";
import { GuardFunction } from "./Guard";
import { AuthenticationPolicyFunction } from "./Authentication";
import { AuthorizationPolicyFunction } from "./Authorization";
import { isHttpMethod } from "@tomasjs/core/http/HttpMethod";

export type WebAppEndpoint = {
  method: HttpMethod;
  path: string;
  handler: WebAppEndpointHandler; // TODO Support other handler types
  options?: EndpointOptions;
};

export type WebAppEndpointHandler = (
  context: IWebAppEndpointContext
) => HttpResponse | Promise<HttpResponse>;

export interface IWebAppEndpointContext extends IEndpointContext {
  readonly services: IServiceProvider;
}

export type EndpointOptions = {
  middlewares?: MiddlewareFunction[]; // TODO Support other middleware types
  interceptors?: InterceptorFunction[]; // TODO Support other interceptor types
  guards?: GuardFunction[]; // TODO Support other guard types
  authentication?: AuthenticationPolicyFunction; // TODO Support other policy types
  authorization?: AuthorizationPolicyFunction; // TODO Support other policy types
};

export class WebAppEndpointContext implements IWebAppEndpointContext {
  constructor(
    readonly method: HttpMethod,
    readonly url: string,
    readonly path: string,
    readonly headers: Readonly<PlainHttpHeaders>,
    readonly params: IRouteParams,
    readonly query: IQueryParams,
    readonly body: IHttpContent<unknown>,
    readonly user: IUserReader,
    readonly services: IServiceProvider
  ) {}

  static from(context: IEndpointContext, services: IServiceProvider): WebAppEndpointContext {
    return new WebAppEndpointContext(
      context.method,
      context.url,
      context.path,
      context.headers,
      context.params,
      context.query,
      context.body,
      context.user,
      services
    );
  }
}

export function isWebAppEndpoint(obj: unknown): obj is WebAppEndpoint {
  return (
    isNotNull(obj) &&
    isHttpMethod((obj as WebAppEndpoint)["method"]) &&
    typeof (obj as WebAppEndpoint)["path"] === "string" &&
    isWebAppEndpointHandler((obj as WebAppEndpoint)["handler"])
  );
}

export function isWebAppEndpointHandler(obj: unknown): obj is WebAppEndpointHandler {
  return isNotNull(obj) && isFunction(obj) && hasLength(obj) && isInRange(obj.length, 0, 1);
}

export interface IEndpoint {
  use(middleware: MiddlewareFunction): this;
  useInterceptor(interceptor: InterceptorFunction): this;
  useGuard(guard: GuardFunction): this;
  useAuthentication(policy: AuthenticationPolicyFunction): this;
  useAuthorization(policy: AuthorizationPolicyFunction): this;
  toPlain(): WebAppEndpoint;
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
    private readonly handler: WebAppEndpointHandler
  ) {}

  static get(path: string, handler: WebAppEndpointHandler): Endpoint {
    return new Endpoint("GET", path, handler);
  }

  static post(path: string, handler: WebAppEndpointHandler): Endpoint {
    return new Endpoint("POST", path, handler);
  }

  static put(path: string, handler: WebAppEndpointHandler): Endpoint {
    return new Endpoint("PUT", path, handler);
  }

  static patch(path: string, handler: WebAppEndpointHandler): Endpoint {
    return new Endpoint("PATCH", path, handler);
  }

  static delete(path: string, handler: WebAppEndpointHandler): Endpoint {
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

  toPlain(): WebAppEndpoint {
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

export function isEndpoint(obj: unknown): obj is Endpoint {
  return obj instanceof Endpoint;
}
