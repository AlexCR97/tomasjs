import { ClassConstructor, internalContainer, isClassConstructor } from "@/container";
import { HttpContextResolver } from "@/core";
import { TomasError } from "@/core/errors";
import { ExpressErrorMiddlewareHandler } from "@/core/express";
import { ErrorHandler } from "./ErrorHandler";
import { ErrorHandlerFunction } from "./ErrorHandlerFunction";
import { ErrorHandlerType } from "./ErrorHandlerType";

export class ErrorHandlerAdapter<THandler extends ErrorHandler = ErrorHandler> {
  constructor(private readonly handler: ErrorHandlerType<THandler>) {}

  adapt(): ExpressErrorMiddlewareHandler {
    if (this.isFunction(this.handler)) {
      return this.fromFunctionToExpress(this.handler);
    }

    if (this.isInstance(this.handler)) {
      return this.fromInstanceToExpress(this.handler);
    }

    if (this.isConstructor(this.handler)) {
      return this.fromConstructorToExpress(this.handler);
    }

    throw new TomasError(`Unknown ErrorHandler ${this.handler}`);
  }

  private isFunction<THandler extends ErrorHandler = ErrorHandler>(
    handler: ErrorHandlerType<THandler>
  ): handler is ErrorHandlerFunction {
    if (typeof handler !== "function") {
      return false;
    }

    // Considering that an ErrorHandlerFunction must be a function...
    return (
      handler.prototype === undefined && // The prototype must be undefined
      handler.length === 3 // It must receive 3 arguments
    );
  }

  private fromFunctionToExpress(handler: ErrorHandlerFunction): ExpressErrorMiddlewareHandler {
    return async (err, req, res, next) => {
      const context = HttpContextResolver.fromExpress(req, res);
      await handler(err, context, next);
    };
  }

  private isInstance<THandler extends ErrorHandler = ErrorHandler>(
    handler: ErrorHandlerType<THandler>
  ): handler is THandler {
    const func = (handler as any).catch as Function;

    if (typeof func !== "function") {
      return false;
    }

    // Considering that "catch" must be a named function...
    return (
      func.name.trim() === "catch" && // The name must be "catch"
      func.prototype === undefined && // The prototype must be undefined
      func.length === 3 // It must receive 3 arguments
    );
  }

  private fromInstanceToExpress<THandler extends ErrorHandler = ErrorHandler>(
    handler: THandler
  ): ExpressErrorMiddlewareHandler {
    return async (err, req, res, next) => {
      const context = HttpContextResolver.fromExpress(req, res);
      await handler.catch(err, context, next);
    };
  }

  private isConstructor<THandler extends ErrorHandler = ErrorHandler>(
    handler: ErrorHandlerType<THandler>
  ): handler is ClassConstructor<THandler> {
    return isClassConstructor(handler as any); // TODO Improve type check
  }

  private fromConstructorToExpress<THandler extends ErrorHandler = ErrorHandler>(
    handler: ClassConstructor<THandler>
  ): ExpressErrorMiddlewareHandler {
    return async (err, req, res, next) => {
      const handlerInstance = internalContainer.get(handler);
      const context = HttpContextResolver.fromExpress(req, res);
      await handlerInstance.catch(err, context, next);
    };
  }
}
