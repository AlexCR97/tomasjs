import { IServiceProvider } from "@tomasjs/core/dependency-injection";
import { HttpMethod, IHttpContent, PlainHttpHeaders } from "@tomasjs/core/http";
import { isHttpMethod } from "@tomasjs/core/http/HttpMethod";
import { IUserReader } from "@/auth";
import { isFunction, isInRange, isNotNull } from "@tomasjs/core/system";
import {
  EndpointHandlerResult,
  IQueryParams,
  IRouteParams,
  IEndpointContext as ServerEndpointContext,
} from "@/server";
import { AuthenticationPolicyType } from "./Authentication";
import { AuthorizationPolicyType } from "./Authorization";
import { GuardType } from "./Guard";
import { InterceptorType } from "./Interceptor";
import { MiddlewareType } from "./Middleware";

export type PlainEndpoint = {
  method: HttpMethod;
  path: string;
  handler: EndpointHandler;
  options?: EndpointOptions;
};

export type EndpointHandler = (
  context: IEndpointContext
) => EndpointHandlerResult | Promise<EndpointHandlerResult>;

export interface IEndpointContext extends ServerEndpointContext {
  readonly services: IServiceProvider;
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
    readonly user: IUserReader,
    readonly services: IServiceProvider
  ) {}

  static from(context: ServerEndpointContext, services: IServiceProvider): EndpointContext {
    return new EndpointContext(
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

export type EndpointOptions = {
  middlewares?: MiddlewareType[];
  interceptors?: InterceptorType[];
  guards?: GuardType[];
  authentication?: AuthenticationPolicyType;
  authorization?: AuthorizationPolicyType;
};

export function isPlainEndpoint(obj: unknown): obj is PlainEndpoint {
  return (
    isNotNull(obj) &&
    isHttpMethod((obj as PlainEndpoint)["method"]) &&
    typeof (obj as PlainEndpoint)["path"] === "string" &&
    isEndpointHandler((obj as PlainEndpoint)["handler"])
  );
}

export function isEndpointHandler(obj: unknown): obj is EndpointHandler {
  return isNotNull(obj) && isFunction(obj) && isInRange(obj.length, 0, 1);
}

export interface IEndpoint {
  use(middleware: MiddlewareType): this;
  useInterceptor(interceptor: InterceptorType): this;
  useGuard(guard: GuardType): this;
  useAuthentication(policy: AuthenticationPolicyType): this;
  useAuthorization(policy: AuthorizationPolicyType): this;
}

export class Endpoint implements IEndpoint {
  private readonly middlewares: MiddlewareType[] = [];
  private readonly interceptors: InterceptorType[] = [];
  private readonly guards: GuardType[] = [];
  private authentication: AuthenticationPolicyType | undefined;
  private authorization: AuthorizationPolicyType | undefined;

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

  use(middleware: MiddlewareType): this {
    this.middlewares.push(middleware);
    return this;
  }

  useInterceptor(interceptor: InterceptorType): this {
    this.interceptors.push(interceptor);
    return this;
  }

  useGuard(guard: GuardType): this {
    this.guards.push(guard);
    return this;
  }

  useAuthentication(policy: AuthenticationPolicyType): this {
    this.authentication = policy;
    return this;
  }

  useAuthorization(policy: AuthorizationPolicyType): this {
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

export function isEndpoint(obj: unknown): obj is Endpoint {
  return obj instanceof Endpoint;
}
