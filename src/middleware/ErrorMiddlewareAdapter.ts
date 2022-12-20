import { ClassConstructor, internalContainer } from "@/container";
import { HttpContextResolver } from "@/core";
import { ExpressErrorMiddlewareHandler } from "@/core/express";
import { ErrorMiddleware } from "./ErrorMiddleware";
import { ErrorMiddlewareHandler } from "./ErrorMiddlewareHandler";

export abstract class ErrorMiddlewareAdapter {
  private constructor() {}

  static fromTypeToExpress<TError>(
    middleware: ErrorMiddlewareHandler<TError>
  ): ExpressErrorMiddlewareHandler<TError> {
    return async (err, req, res, next) => {
      const context = HttpContextResolver.fromExpress(req, res); // HttpContext needs to be resolved at runtime to support DI
      await middleware(err, context, next);
    };
  }

  static fromInstanceToExpress<TError>(
    middleware: ErrorMiddleware
  ): ExpressErrorMiddlewareHandler<TError> {
    return async (err, req, res, next) => {
      const context = HttpContextResolver.fromExpress(req, res); // HttpContext needs to be resolved at runtime to support DI
      await middleware.handle(err, context, next);
    };
  }

  static fromConstructorToExpress<TError, TMiddleware extends ErrorMiddleware = ErrorMiddleware>(
    middleware: ClassConstructor<TMiddleware>
  ): ExpressErrorMiddlewareHandler<TError> {
    return async (err, req, res, next) => {
      const middlewareInstance = internalContainer.get(middleware); // ErrorMiddleware needs to be resolved at runtime to support DI
      const context = HttpContextResolver.fromExpress(req, res); // HttpContext needs to be resolved at runtime to support DI
      await middlewareInstance.handle(err, context, next);
    };
  }
}
