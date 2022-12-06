import { HttpContextResolver } from "@/core/HttpContextResolver";
import { container } from "tsyringe";
import { constructor } from "tsyringe/dist/typings/types";
import { ThomasErrorMiddleware } from "./ErrorMiddleware";
import { ExpressErrorMiddlewareHandler, ThomasErrorMiddlewareHandler } from "./types";

export class ErrorMiddlewareAdapter {
  private constructor() {}

  static fromTypeToExpress<TError, TResult>(
    middleware: ThomasErrorMiddlewareHandler<TError, TResult>
  ): ExpressErrorMiddlewareHandler<TError, TResult> {
    return (err, req, res, next) => {
      const context = HttpContextResolver.fromExpress(req, res); // HttpContext needs to be resolved at runtime to support DI
      return middleware(err, context, next);
    };
  }

  static fromInstanceToExpress<TError, TResult>(
    middleware: ThomasErrorMiddleware
  ): ExpressErrorMiddlewareHandler<TError, TResult> {
    return (err, req, res, next) => {
      const context = HttpContextResolver.fromExpress(req, res); // HttpContext needs to be resolved at runtime to support DI
      return middleware.handle(err, context, next);
    };
  }

  static fromConstructorToExpress<
    TError,
    TResult,
    TMiddleware extends ThomasErrorMiddleware = ThomasErrorMiddleware
  >(middleware: constructor<TMiddleware>): ExpressErrorMiddlewareHandler<TError, TResult> {
    return (err, req, res, next) => {
      const middlewareInstance = container.resolve(middleware); // ErrorMiddleware needs to be resolved at runtime to support DI
      const context = HttpContextResolver.fromExpress(req, res); // HttpContext needs to be resolved at runtime to support DI
      return middlewareInstance.handle(err, context, next);
    };
  }
}
