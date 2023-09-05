import { Middleware, isMiddlewareInstance } from "./Middleware";
import { MiddlewareFunction, isMiddlewareFunction } from "./MiddlewareFunction";
import {
  ClassConstructor,
  Container,
  NotImplementedError,
  TomasLogger,
  isClassConstructor,
} from "@tomasjs/core";
import { MiddlewareType } from "./MiddlewareType";
import { MiddlewareFactory, isMiddlewareFactory } from "./MiddlewareFactory";
import { ExpressMiddlewareFunction } from "@/core/express";
import { HttpContextAdapter } from "@/core";

export class MiddlewareAdapter {
  private readonly container: Container;
  private readonly middleware: MiddlewareType;
  private readonly logger = new TomasLogger(MiddlewareAdapter.name, "debug");

  constructor(options: { container: Container; middleware: MiddlewareType }) {
    this.container = options.container;
    this.middleware = options.middleware;
  }

  adapt(): ExpressMiddlewareFunction {
    if (isMiddlewareFunction(this.middleware)) {
      this.logger?.debug("The middleware is a MiddlewareFunction");
      return this.fromFunction(this.middleware);
    }

    if (isMiddlewareInstance(this.middleware)) {
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
      const httpContext = new HttpContextAdapter(req, res).adapt();
      await middleware(httpContext, next);
    };
  }

  private fromInstance(middleware: Middleware): ExpressMiddlewareFunction {
    return async (req, res, next) => {
      const httpContext = new HttpContextAdapter(req, res).adapt();
      await middleware.delegate(httpContext, next);
    };
  }

  private fromConstructor(middleware: ClassConstructor<Middleware>): ExpressMiddlewareFunction {
    return async (req, res, next) => {
      const httpContext = new HttpContextAdapter(req, res).adapt();
      const middlewareInstance = this.container.get(middleware);
      await middlewareInstance.delegate(httpContext, next);
    };
  }

  private fromFactory(factory: MiddlewareFactory): ExpressMiddlewareFunction {
    const middleware = factory.create();

    const middlewareAdapter = new MiddlewareAdapter({
      container: this.container,
      middleware,
    });

    return middlewareAdapter.adapt();
  }
}
