import { HttpContextResolver } from "@/core";
import { ExpressMiddlewareHandler } from "@/core/express";
import { isConstructorToken } from "@/core/tsyringe";
import { container } from "tsyringe";
import { constructor } from "tsyringe/dist/typings/types";
import { Middleware } from "./Middleware";
import { isMiddlewareHandler, MiddlewareHandler } from "./MiddlewareHandler";

/**
 * Resolves a `Middleware` into an `ExpressMiddlewareHandler`.
 *
 * Considering that:
 * `TMiddleware extends Middleware = Middleware`
 *
 * Then, a valid `Middleware` could be:
 * - An arrow function of type `MiddlewareHandler`
 * - An instance of a `TMiddleware`
 * - A constructor of a `TMiddleware`
 */
export class MiddlewareAdapter {
  private constructor() {}

  static isAdapter<TMiddleware extends Middleware = Middleware>(
    obj: any
  ): obj is MiddlewareHandler | TMiddleware | constructor<TMiddleware> {
    return isMiddlewareHandler(obj) || obj instanceof Middleware || isConstructorToken(obj);
  }

  static from(middleware: MiddlewareHandler | Middleware | constructor<Middleware>) {
    if (isMiddlewareHandler(middleware)) {
      return MiddlewareAdapter.fromType(middleware);
    }
    if (middleware instanceof Middleware) {
      return MiddlewareAdapter.fromInstance(middleware);
    }
    return MiddlewareAdapter.fromConstructor(middleware);
  }

  static fromType(middleware: MiddlewareHandler): ExpressMiddlewareHandler {
    return async (req, res, next) => {
      const context = HttpContextResolver.fromExpress(req, res); // HttpContext needs to be resolved at runtime to support DI
      await middleware(context, next);
    };
  }

  static fromInstance<TMiddleware extends Middleware = Middleware>(
    middleware: TMiddleware
  ): ExpressMiddlewareHandler {
    return async (req, res, next) => {
      const context = HttpContextResolver.fromExpress(req, res); // HttpContext needs to be resolved at runtime to support DI
      await middleware.handle(context, next);
    };
  }

  static fromConstructor<TMiddleware extends Middleware = Middleware>(
    middleware: constructor<TMiddleware>
  ): ExpressMiddlewareHandler {
    return async (req, res, next) => {
      const middlewareInstance = container.resolve(middleware); // Middleware needs to be resolved at runtime to support DI
      const context = HttpContextResolver.fromExpress(req, res); // HttpContext needs to be resolved at runtime to support DI
      await middlewareInstance.handle(context, next);
    };
  }
}
