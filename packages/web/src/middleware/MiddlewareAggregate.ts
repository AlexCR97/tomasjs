import { AuthenticationPolicy, AuthorizationPolicy, authentication, authorization } from "@/auth";
import { ErrorHandler, errorHandler } from "@/error-handler";
import { GuardFunction, guard } from "@/guard";
import { InterceptorFunction, interceptor } from "@/interceptor";
import { MiddlewareFunction } from "./Middleware";
import { PlainEndpoint, endpoints as endpointsMiddleware } from "@/endpoint";

export interface IMiddlewareAggregate {
  addErrorHandler(...errorHandlers: ErrorHandler[]): this;
  addMiddleware(...middlewares: MiddlewareFunction[]): this;
  addInterceptor(...interceptors: InterceptorFunction[]): this;
  addGuard(...guards: GuardFunction[]): this;
  addAuthentication(...policies: AuthenticationPolicy[]): this;
  addAuthorization(...policies: AuthorizationPolicy[]): this;
  addEndpoint(...endpoints: PlainEndpoint[]): this;
  get(): MiddlewareFunction[];
}

export class MiddlewareAggregate implements IMiddlewareAggregate {
  private readonly middlewares: MiddlewareFunction[] = [];

  addErrorHandler(...errorHandlers: ErrorHandler[]): this {
    return this.addMiddleware(...errorHandlers.map(errorHandler));
  }

  addMiddleware(...middlewares: MiddlewareFunction[]): this {
    this.middlewares.push(...middlewares);
    return this;
  }

  addInterceptor(...interceptors: InterceptorFunction[]): this {
    return this.addMiddleware(...interceptors.map(interceptor));
  }

  addGuard(...guards: GuardFunction[]): this {
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

  get(): MiddlewareFunction[] {
    return this.middlewares;
  }
}
