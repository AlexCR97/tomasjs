import { HttpMethod } from "@tomasjs/core/http";
import { EndpointHandler } from "./PlainEndpoint";
import { PlainEndpoint } from "./PlainEndpoint";
import { AuthenticationPolicyFunction, AuthorizationPolicyFunction } from "@/auth";
import { GuardFunction } from "@/guard";
import { InterceptorFunction } from "@/interceptor";
import { MiddlewareFunction } from "@/middleware";

interface IEndpoint {
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
