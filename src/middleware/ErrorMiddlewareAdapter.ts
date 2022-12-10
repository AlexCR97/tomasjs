import { HttpContextResolver } from "@/core/HttpContextResolver";
import { container } from "tsyringe";
import { constructor } from "tsyringe/dist/typings/types";
import { ThomasErrorMiddleware } from "./ErrorMiddleware";
import { ExpressErrorMiddlewareHandler, ThomasErrorMiddlewareHandler } from "./types";

export class ErrorMiddlewareAdapter {
  private constructor() {}

  static fromTypeToExpress<TError>(
    middleware: ThomasErrorMiddlewareHandler<TError>
  ): ExpressErrorMiddlewareHandler<TError> {
    return async (err, req, res, next) => {
      const context = HttpContextResolver.fromExpress(req, res); // HttpContext needs to be resolved at runtime to support DI
      await middleware(err, context, next);
    };
  }

  static fromInstanceToExpress<TError>(
    middleware: ThomasErrorMiddleware
  ): ExpressErrorMiddlewareHandler<TError> {
    return async (err, req, res, next) => {
      const context = HttpContextResolver.fromExpress(req, res); // HttpContext needs to be resolved at runtime to support DI
      await middleware.handle(err, context, next);
    };
  }

  static fromConstructorToExpress<
    TError,
    TResult,
    TMiddleware extends ThomasErrorMiddleware = ThomasErrorMiddleware
  >(middleware: constructor<TMiddleware>): ExpressErrorMiddlewareHandler<TError> {
    return async (err, req, res, next) => {
      const middlewareInstance = container.resolve(middleware); // ErrorMiddleware needs to be resolved at runtime to support DI
      const context = HttpContextResolver.fromExpress(req, res); // HttpContext needs to be resolved at runtime to support DI
      await middlewareInstance.handle(err, context, next);
    };
  }
}
