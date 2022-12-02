import { RequestHandler } from "express";
import { container } from "tsyringe";
import { constructor } from "tsyringe/dist/typings/types";
import { Middleware } from "../../middleware";
import { OnBeforeMiddleware } from "../types";

export abstract class ExpressRequestHandlerFactory {
  private constructor() {}

  static fromMiddlewares(
    middlewares: OnBeforeMiddleware | OnBeforeMiddleware[] | undefined
  ): RequestHandler[] {
    if (middlewares === undefined || middlewares === null) {
      return [];
    }

    return Array.isArray(middlewares)
      ? this.fromMiddlewareArray(middlewares)
      : [this.fromMiddleware(middlewares)];
  }

  private static fromMiddleware<TConstructor extends Middleware>(
    middleware: OnBeforeMiddleware<TConstructor>
  ): RequestHandler {
    return middleware instanceof Middleware
      ? this.fromMiddlewareInstance(middleware)
      : this.fromMiddlewareConstructor(middleware);
  }

  private static fromMiddlewareArray(middlewares: OnBeforeMiddleware[]): RequestHandler[] {
    if (middlewares === undefined || middlewares === null || middlewares.length === 0) {
      return [];
    }

    return middlewares
      .filter((middleware) => middleware !== undefined && middleware !== null)
      .map((middleware) => this.fromMiddleware(middleware!));
  }

  private static fromMiddlewareInstance(instance: Middleware): RequestHandler {
    return (req, res, next) => {
      instance.handle(req, res, next);
    };
  }

  private static fromMiddlewareConstructor<T extends Middleware>(
    constructor: constructor<T>
  ): RequestHandler {
    const instance = container.resolve(constructor);
    return this.fromMiddlewareInstance(instance);
  }
}
