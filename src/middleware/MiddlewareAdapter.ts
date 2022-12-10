import { HttpContextResolver } from "@/core";
import { isConstructorToken } from "@/core/tsyringe";
import { container } from "tsyringe";
import { constructor } from "tsyringe/dist/typings/types";
import { ThomasMiddleware } from "./Middleware";
import {
  ExpressMiddlewareHandler,
  isThomasMiddlewareHandler,
  ThomasMiddlewareHandler,
} from "./types";

/**
 * Resolves a `Middleware` into an `ExpressMiddlewareHandler`.
 *
 * Considering that:
 * `TMiddleware extends ThomasMiddleware = ThomasMiddleware`
 *
 * Then, a valid `Middleware` could be:
 * - An arrow function of type `ThomasMiddlewareHandler`
 * - An instance of a `TMiddleware`
 * - A constructor of a `TMiddleware`
 */
export class MiddlewareAdapter {
  private constructor() {}

  static isAdapter<TMiddleware extends ThomasMiddleware = ThomasMiddleware>(
    obj: any
  ): obj is ThomasMiddlewareHandler | TMiddleware | constructor<TMiddleware> {
    return (
      isThomasMiddlewareHandler(obj) || obj instanceof ThomasMiddleware || isConstructorToken(obj)
    );
  }

  static from(
    middleware: ThomasMiddlewareHandler | ThomasMiddleware | constructor<ThomasMiddleware>
  ) {
    if (isThomasMiddlewareHandler(middleware)) {
      return MiddlewareAdapter.fromType(middleware);
    }
    if (middleware instanceof ThomasMiddleware) {
      return MiddlewareAdapter.fromInstance(middleware);
    }
    return MiddlewareAdapter.fromConstructor(middleware);
  }

  static fromType(middleware: ThomasMiddlewareHandler): ExpressMiddlewareHandler {
    return async (req, res, next) => {
      const context = HttpContextResolver.fromExpress(req, res); // HttpContext needs to be resolved at runtime to support DI
      await middleware(context, next);
    };
  }

  static fromInstance<TMiddleware extends ThomasMiddleware = ThomasMiddleware>(
    middleware: TMiddleware
  ): ExpressMiddlewareHandler {
    return async (req, res, next) => {
      const context = HttpContextResolver.fromExpress(req, res); // HttpContext needs to be resolved at runtime to support DI
      await middleware.handle(context, next);
    };
  }

  static fromConstructor<TMiddleware extends ThomasMiddleware = ThomasMiddleware>(
    middleware: constructor<TMiddleware>
  ): ExpressMiddlewareHandler {
    return async (req, res, next) => {
      const middlewareInstance = container.resolve(middleware); // Middleware needs to be resolved at runtime to support DI
      const context = HttpContextResolver.fromExpress(req, res); // HttpContext needs to be resolved at runtime to support DI
      await middlewareInstance.handle(context, next);
    };
  }
}
