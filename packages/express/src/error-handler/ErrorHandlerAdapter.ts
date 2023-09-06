import {
  ClassConstructor,
  Container,
  Logger,
  NotImplementedError,
  TomasLogger,
  isClassConstructor,
} from "@tomasjs/core";
import { ExpressErrorMiddlewareFunction } from "@/core/express";
import { ErrorHandler, isErrorHandlerInstance } from "./ErrorHandler";
import { ErrorHandlerFunction, isErrorHandlerFunction } from "./ErrorHandlerFunction";
import { ErrorHandlerType } from "./ErrorHandlerType";
import { ErrorHandlerFactory, isErrorHandlerFactory } from "./ErrorHandlerFactory";
import { httpContextFactory } from "@/core";

export class ErrorHandlerAdapter {
  private readonly logger: Logger = new TomasLogger(ErrorHandlerAdapter.name, "error");
  private readonly container: Container;
  private readonly errorHandler: ErrorHandlerType;

  constructor(options: { container: Container; errorHandler: ErrorHandlerType; logger?: Logger }) {
    this.container = options.container;
    this.errorHandler = options.errorHandler;
  }

  adapt(): ExpressErrorMiddlewareFunction {
    if (isErrorHandlerFunction(this.errorHandler)) {
      this.logger?.debug("The errorHandler is an ErrorHandlerFunction");
      return this.fromFunction(this.errorHandler);
    }

    if (isErrorHandlerInstance(this.errorHandler)) {
      this.logger?.debug("The errorHandler is an ErrorHandler instance");
      return this.fromInstance(this.errorHandler);
    }

    if (isClassConstructor(this.errorHandler)) {
      this.logger?.debug("The errorHandler is an ErrorHandler constructor");
      return this.fromConstructor(this.errorHandler);
    }

    if (isErrorHandlerFactory(this.errorHandler)) {
      this.logger?.debug("The errorHandler is an ErrorHandlerFactory");
      return this.fromFactory(this.errorHandler);
    }

    this.logger?.debug("The errorHandler did not match any of the supported types.");
    throw new NotImplementedError(this.adapt.name);
  }

  private fromFunction(errorHandler: ErrorHandlerFunction): ExpressErrorMiddlewareFunction {
    return async (err, req, res, next) => {
      const httpContext = httpContextFactory(req, res);
      await errorHandler(err, httpContext, next);
    };
  }

  private fromInstance(errorHandler: ErrorHandler): ExpressErrorMiddlewareFunction {
    return async (err, req, res, next) => {
      const httpContext = httpContextFactory(req, res);
      await errorHandler.catch(err, httpContext, next);
    };
  }

  private fromConstructor(
    errorHandler: ClassConstructor<ErrorHandler>
  ): ExpressErrorMiddlewareFunction {
    return async (err, req, res, next) => {
      const httpContext = httpContextFactory(req, res);
      const errorHandlerInstance = this.container.get(errorHandler);
      await errorHandlerInstance.catch(err, httpContext, next);
    };
  }

  private fromFactory(factory: ErrorHandlerFactory): ExpressErrorMiddlewareFunction {
    const errorHandler = factory.create();

    const errorHandlerAdapter = new ErrorHandlerAdapter({
      container: this.container,
      errorHandler,
      logger: this.logger,
    });

    return errorHandlerAdapter.adapt();
  }
}
