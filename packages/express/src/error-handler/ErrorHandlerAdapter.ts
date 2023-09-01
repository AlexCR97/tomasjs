import {
  ClassConstructor,
  Container,
  Logger,
  NotImplementedError,
  isClassConstructor,
} from "@tomasjs/core";
import { ExpressErrorMiddlewareFunction } from "@/core/express";
import { ErrorHandler, isErrorHandlerInstance } from "./ErrorHandler";
import { ErrorHandlerFunction, isErrorHandlerFunction } from "./ErrorHandlerFunction";
import { ErrorHandlerType } from "./ErrorHandlerType";
import { ErrorHandlerFactory, isErrorHandlerFactory } from "./ErrorHandlerFactory";

export class ErrorHandlerAdapter {
  constructor(
    private readonly options: {
      container: Container;
      errorHandler: ErrorHandlerType;
      logger?: Logger;
    }
  ) {}

  private get container(): Container {
    return this.options.container;
  }

  private get errorHandler() {
    return this.options.errorHandler;
  }

  private get logger() {
    return this.options.logger;
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
      await errorHandler(err, req, res, next);
    };
  }

  private fromInstance(errorHandler: ErrorHandler): ExpressErrorMiddlewareFunction {
    return async (err, req, res, next) => {
      await errorHandler.catch(err, req, res, next);
    };
  }

  private fromConstructor(
    errorHandler: ClassConstructor<ErrorHandler>
  ): ExpressErrorMiddlewareFunction {
    return async (err, req, res, next) => {
      const errorHandlerInstance = this.container.get(errorHandler);
      await errorHandlerInstance.catch(err, req, res, next);
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
