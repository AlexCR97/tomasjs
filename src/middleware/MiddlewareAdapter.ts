import { HttpContextResolver } from "@/core/HttpContextResolver";
import { container } from "tsyringe";
import { constructor } from "tsyringe/dist/typings/types";
import { ThomasMiddleware } from "./Middleware";
import { ExpressMiddlewareHandler, ThomasMiddlewareHandler } from "./types";

export class MiddlewareAdapter {
  private constructor() {}

  static fromTypeToExpress<TResult>(
    middleware: ThomasMiddlewareHandler<TResult>
  ): ExpressMiddlewareHandler<TResult> {
    return (req, res, next) => {
      const context = HttpContextResolver.fromExpress(req, res); // HttpContext needs to be resolved at runtime to support DI
      return middleware(context, next);
    };
  }

  static fromInstanceToExpress<TResult>(
    middleware: ThomasMiddleware
  ): ExpressMiddlewareHandler<TResult> {
    return (req, res, next) => {
      const context = HttpContextResolver.fromExpress(req, res); // HttpContext needs to be resolved at runtime to support DI
      return middleware.handle(context, next);
    };
  }

  static fromConstructorToExpress<TResult, TMiddleware extends ThomasMiddleware = ThomasMiddleware>(
    middleware: constructor<TMiddleware>
  ): ExpressMiddlewareHandler<TResult> {
    return (req, res, next) => {
      const middlewareInstance = container.resolve(middleware); // Middleware needs to be resolved at runtime to support DI
      const context = HttpContextResolver.fromExpress(req, res); // HttpContext needs to be resolved at runtime to support DI
      return middlewareInstance.handle(context, next);
    };
  }
}
