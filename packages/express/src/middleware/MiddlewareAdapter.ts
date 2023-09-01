import { isMiddleware, Middleware } from "./Middleware";
import { isMiddlewareFunction, MiddlewareFunction } from "./MiddlewareFunction";
import {
  ClassConstructor,
  Container,
  isClassConstructor,
  Logger,
  NotImplementedError,
} from "@tomasjs/core";
import { MiddlewareType } from "./MiddlewareType";
import { isMiddlewareFactory, MiddlewareFactory } from "./MiddlewareFactory";
import { ExpressMiddlewareFunction } from "@/core/express";

export class MiddlewareAdapter {
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

  private get logger() {
    return this.options.logger;
  }

  adapt(): ExpressMiddlewareFunction {
    if (isMiddlewareFunction(this.middleware)) {
      this.logger?.debug("The middleware is a MiddlewareFunction");
      return this.fromFunction(this.middleware);
    }

    if (isMiddleware(this.middleware)) {
      this.logger?.debug("The middleware is a Middleware instance");
      return this.fromInstance(this.middleware);
    }

    if (isClassConstructor(this.middleware)) {
      this.logger?.debug("The middleware is a class constructor");
      return this.fromConstructor(this.middleware);
    }

    if (isMiddlewareFactory(this.middleware)) {
      this.logger?.debug("The middleware is a MiddlewareFactory instance");
      return this.fromFactory(this.middleware);
    }

    this.logger?.debug("The middleware did not match any of the supported types.");
    throw new NotImplementedError(this.adapt.name);
  }

  private fromFunction(middleware: MiddlewareFunction): ExpressMiddlewareFunction {
    return async (req, res, next) => {
      await middleware(req, res, next);
    };
  }

  private fromInstance(middleware: Middleware): ExpressMiddlewareFunction {
    return async (req, res, next) => {
      await middleware.handle(req, res, next);
    };
  }

  private fromConstructor(middleware: ClassConstructor<Middleware>): ExpressMiddlewareFunction {
    return async (req, res, next) => {
      const middlewareInstance = this.container.get(middleware);
      await middlewareInstance.handle(req, res, next);
    };
  }

  private fromFactory(factory: MiddlewareFactory): ExpressMiddlewareFunction {
    const middleware = factory.create();

    const middlewareAdapter = new MiddlewareAdapter({
      container: this.container,
      middleware,
      logger: this.logger,
    });

    return middlewareAdapter.adapt();
  }
}
