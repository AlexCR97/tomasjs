import { HttpMethod } from "@tomasjs/core/http";
import { EndpointHandler } from "./PlainEndpoint";
import { PlainEndpoint } from "./PlainEndpoint";
import { AuthenticationPolicy, AuthorizationPolicy } from "@/auth";
import { Guard } from "@/guard";
import { Interceptor } from "@/interceptor";
import { Middleware } from "@/middleware";

interface IEndpoint {
  use(middleware: Middleware): this;
  useInterceptor(interceptor: Interceptor): this;
  useGuard(guard: Guard): this;
  useAuthentication(policy: AuthenticationPolicy): this;
  useAuthorization(policy: AuthorizationPolicy): this;
  toPlain(): PlainEndpoint;
}

export class Endpoint implements IEndpoint {
  private readonly middlewares: Middleware[] = [];
  private readonly interceptors: Interceptor[] = [];
  private readonly guards: Guard[] = [];
  private authentication: AuthenticationPolicy | undefined;
  private authorization: AuthorizationPolicy | undefined;

  constructor(
    private readonly method: HttpMethod,
    private readonly path: string,
    private readonly handler: EndpointHandler
  ) {}

  static get(path: string, handler: EndpointHandler): Endpoint {
    return new Endpoint("get", path, handler);
  }

  static post(path: string, handler: EndpointHandler): Endpoint {
    return new Endpoint("post", path, handler);
  }

  static put(path: string, handler: EndpointHandler): Endpoint {
    return new Endpoint("put", path, handler);
  }

  static patch(path: string, handler: EndpointHandler): Endpoint {
    return new Endpoint("patch", path, handler);
  }

  static delete(path: string, handler: EndpointHandler): Endpoint {
    return new Endpoint("delete", path, handler);
  }

  use(middleware: Middleware): this {
    this.middlewares.push(middleware);
    return this;
  }

  useInterceptor(interceptor: Interceptor): this {
    this.interceptors.push(interceptor);
    return this;
  }

  useGuard(guard: Guard): this {
    this.guards.push(guard);
    return this;
  }

  useAuthentication(policy: AuthenticationPolicy): this {
    this.authentication = policy;
    return this;
  }

  useAuthorization(policy: AuthorizationPolicy): this {
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
