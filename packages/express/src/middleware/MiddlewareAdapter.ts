import { HttpContextResolver } from "@/core";
import { ExpressMiddlewareHandler } from "@/core/express";
import { Middleware } from "./Middleware";
import { isMiddlewareHandler, MiddlewareHandler } from "./MiddlewareHandler";
import { ClassConstructor, Container } from "@tomasjs/core";
import { Logger } from "@tomasjs/logging";
import { MiddlewareType } from "./MiddlewareType";

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
export class MiddlewareAdapter<TMiddleware extends Middleware = Middleware> {
  constructor(
    private readonly options: {
      container: Container;
      middleware: MiddlewareType;
      logger?: Logger;
    }
  ) {}

  private get container(): Container {
    return this.options.container;
  }

  private get middleware() {
    return this.options.middleware;
  }

  isMiddleware(obj: any): obj is TMiddleware {
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

  adapt() {
    // console.log("from", middleware);

    if (isMiddlewareHandler(this.middleware)) {
      // console.log("middleware is type");
      return this.fromType(this.middleware);
    }

    if (this.isMiddleware(this.middleware)) {
      // console.log("middleware is instance");
      return this.fromInstance(this.middleware);
    }

    // console.log("middleware is instance");
    return this.fromConstructor(this.middleware as any); // TODO Improve type-check
  }

  private fromType(middleware: MiddlewareHandler): ExpressMiddlewareHandler {
    return async (req, res, next) => {
      const context = HttpContextResolver.fromExpress(req, res);
      await middleware(context, next);
    };
  }

  private fromInstance(middleware: TMiddleware): ExpressMiddlewareHandler {
    return async (req, res, next) => {
      const context = HttpContextResolver.fromExpress(req, res);
      await middleware.handle(context, next);
    };
  }

  private fromConstructor(middleware: ClassConstructor<TMiddleware>): ExpressMiddlewareHandler {
    return async (req, res, next) => {
      try {
        // console.log("resolving middleware instance...");
        this.container.get(middleware);
        // console.log("middleware instance resolved!");
      } catch (err) {
        // console.log("err", err);
        throw err;
      }

      // console.log("resolving middleware instance...");
      const middlewareInstance = this.container.get(middleware);
      // console.log("middleware instance resolved!", middlewareInstance);

      const context = HttpContextResolver.fromExpress(req, res);
      await middlewareInstance.handle(context, next);
    };
  }
}
