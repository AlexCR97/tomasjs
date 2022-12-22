import { ClassConstructor, internalContainer } from "@/container";
import { HttpContextResolver } from "@/core";
import { ExpressMiddlewareHandler } from "@/core/express";
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
export abstract class MiddlewareAdapter {
  private constructor() {}

  static isMiddleware(obj: any): obj is Middleware {
    if (obj === undefined || obj === null) {
      return false;
    }

    const func = obj.handle as Function;

    if (typeof func !== "function") {
      return false;
    }

    // Considering that "handle" must be a named function...
    return (
      func.name.trim() === "handle" && // The name must be "handle"
      func.prototype === undefined && // The prototype must be undefined
      func.length === 2 // It must receive 2 arguments
    );
  }

  static from(middleware: MiddlewareHandler | Middleware | ClassConstructor<Middleware>) {
    // console.log("from", middleware);

    if (isMiddlewareHandler(middleware)) {
      // console.log("middleware is type");
      return MiddlewareAdapter.fromType(middleware);
    }
    if (this.isMiddleware(middleware)) {
      // console.log("middleware is instance");
      return MiddlewareAdapter.fromInstance(middleware);
    }

    // console.log("middleware is instance");
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
    middleware: ClassConstructor<TMiddleware>
  ): ExpressMiddlewareHandler {
    return async (req, res, next) => {
      try {
        console.log("resolving middleware instance...");
        internalContainer.get(middleware); // Middleware needs to be resolved at runtime to support DI
        console.log("middleware instance resolved!");
      } catch (err) {
        console.log("err", err);
        throw err;
      }

      console.log("resolving middleware instance...");
      const middlewareInstance = internalContainer.get(middleware); // Middleware needs to be resolved at runtime to support DI
      console.log("middleware instance resolved!", middlewareInstance);

      const context = HttpContextResolver.fromExpress(req, res); // HttpContext needs to be resolved at runtime to support DI
      await middlewareInstance.handle(context, next);
    };
  }
}
