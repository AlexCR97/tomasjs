import { Endpoint } from "./Endpoint";
import { endpointsMiddleware } from "./EndpointMiddleware";
import { ErrorHandler, ErrorHandlerFunction, errorHandlerMiddleware } from "./ErrorHandler";
import { Guard, GuardFunction, guard } from "./Guard";
import { Interceptor, interceptor } from "./Interceptor";
import { Middleware, MiddlewareFunction } from "./Middleware";

interface IMiddlewareAggregate {
  addErrorHandler(...errorHandlers: ErrorHandler[]): this;
  addMiddleware(...middlewares: Middleware[]): this;
  addInterceptor(...interceptors: Interceptor[]): this;
  addGuard(...guards: Guard[]): this;
  addEndpoint(...endpoints: Endpoint[]): this;
  get(): Middleware[];
}

export class MiddlewareAggregate implements IMiddlewareAggregate {
  private readonly middlewares: Middleware[] = [];

  addErrorHandler(...errorHandlers: ErrorHandlerFunction[]): this {
    return this.addMiddleware(...errorHandlers.map(errorHandlerMiddleware));
  }

  addMiddleware(...middlewares: MiddlewareFunction[]): this {
    this.middlewares.push(...middlewares);
    return this;
  }

  addInterceptor(...interceptors: Interceptor[]): this {
    return this.addMiddleware(...interceptors.map(interceptor));
  }

  addGuard(...guards: GuardFunction[]): this {
    return this.addMiddleware(...guards.map(guard));
  }

  addEndpoint(...endpoints: Endpoint[]): this {
    return this.addMiddleware(endpointsMiddleware(endpoints));
  }

  get(): MiddlewareFunction[] {
    return this.middlewares;
  }
}
