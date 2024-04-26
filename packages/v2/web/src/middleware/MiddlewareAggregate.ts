import { AuthenticationPolicy, AuthorizationPolicy, authentication, authorization } from "@/auth";
import { ErrorHandler, errorHandler } from "@/error-handler";
import { Guard, guard } from "@/guard";
import { Interceptor, interceptor } from "@/interceptor";
import { Middleware } from "./Middleware";
import { PlainEndpoint, endpoints as endpointsMiddleware } from "@/endpoint";

interface IMiddlewareAggregate {
  addErrorHandler(...errorHandlers: ErrorHandler[]): this;
  addMiddleware(...middlewares: Middleware[]): this;
  addInterceptor(...interceptors: Interceptor[]): this;
  addGuard(...guards: Guard[]): this;
  addAuthentication(...policies: AuthenticationPolicy[]): this;
  addAuthorization(...policies: AuthorizationPolicy[]): this;
  addEndpoint(...endpoints: PlainEndpoint[]): this;
  get(): Middleware[];
}

export class MiddlewareAggregate implements IMiddlewareAggregate {
  private readonly middlewares: Middleware[] = [];

  addErrorHandler(...errorHandlers: ErrorHandler[]): this {
    return this.addMiddleware(...errorHandlers.map(errorHandler));
  }

  addMiddleware(...middlewares: Middleware[]): this {
    this.middlewares.push(...middlewares);
    return this;
  }

  addInterceptor(...interceptors: Interceptor[]): this {
    return this.addMiddleware(...interceptors.map(interceptor));
  }

  addGuard(...guards: Guard[]): this {
    return this.addMiddleware(...guards.map(guard));
  }

  addAuthentication(...policies: AuthenticationPolicy[]): this {
    for (const policy of policies) {
      const middlewares = authentication(policy);
      this.addMiddleware(...middlewares);
    }

    return this;
  }

  addAuthorization(...policies: AuthorizationPolicy[]): this {
    for (const policy of policies) {
      const middlewares = authorization(policy);
      this.addMiddleware(...middlewares);
    }

    return this;
  }

  addEndpoint(...endpoints: PlainEndpoint[]): this {
    return this.addMiddleware(endpointsMiddleware(endpoints));
  }

  get(): Middleware[] {
    return this.middlewares;
  }
}
