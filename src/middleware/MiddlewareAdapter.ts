import { HttpContextResolver } from "@/core/HttpContextResolver";
import { container } from "tsyringe";
import { constructor } from "tsyringe/dist/typings/types";
import { ThomasMiddleware } from "./Middleware";
import { ExpressMiddlewareHandler, ThomasMiddlewareHandler } from "./types";

export class MiddlewareAdapter {
  private constructor() {}

  static fromThomasToExpress(
    middleware: ThomasMiddlewareHandler | ThomasMiddleware | constructor<ThomasMiddleware>
  ) {
    if (typeof middleware === "function") {
      return MiddlewareAdapter.fromTypeToExpress(middleware as any);
    }
    if (middleware instanceof ThomasMiddleware) {
      return MiddlewareAdapter.fromInstanceToExpress(middleware);
    }
    return MiddlewareAdapter.fromConstructorToExpress(middleware);
  }

  static fromTypeToExpress(middleware: ThomasMiddlewareHandler): ExpressMiddlewareHandler {
    return async (req, res, next) => {
      const context = HttpContextResolver.fromExpress(req, res); // HttpContext needs to be resolved at runtime to support DI
      await middleware(context, next);
    };
  }

  static fromInstanceToExpress(middleware: ThomasMiddleware): ExpressMiddlewareHandler {
    return async (req, res, next) => {
      const context = HttpContextResolver.fromExpress(req, res); // HttpContext needs to be resolved at runtime to support DI
      await middleware.handle(context, next);
    };
  }

  static fromConstructorToExpress<TMiddleware extends ThomasMiddleware = ThomasMiddleware>(
    middleware: constructor<TMiddleware>
  ): ExpressMiddlewareHandler {
    return async (req, res, next) => {
      const middlewareInstance = container.resolve(middleware); // Middleware needs to be resolved at runtime to support DI
      const context = HttpContextResolver.fromExpress(req, res); // HttpContext needs to be resolved at runtime to support DI
      await middlewareInstance.handle(context, next);
    };
  }
}
