import {
  ExpressMiddlewareHandler,
  ExpressPathNormalizer,
  ExpressRequestHandler,
} from "@/core/express";
import { GuardAdapter } from "@/guards";
import { MiddlewareAdapter, MiddlewareFactoryAdapter } from "@/middleware";
import { ResponseAdapter } from "@/responses";
import { Router } from "express";
import { Controller } from "./Controller";
import { ControllerMetadata, HttpMethodMetadata } from "./metadata";
import { Logger } from "@tomasjs/logging";
import { Container } from "@tomasjs/core";

/**
 * Adapts a Controller to an Express Router.
 */
export class ControllerAdapter {
  constructor(
    private readonly options: {
      container: Container;
      controller: Controller;
      logger?: Logger;
    }
  ) {}

  private get container(): Container {
    return this.options.container;
  }

  private get controller(): Controller {
    return this.options.controller;
  }

  private get logger(): Logger | undefined {
    return this.options.logger;
  }

  adapt(): Router {
    const router = Router();
    const controllerMetadata = new ControllerMetadata(this.controller);
    const controllerLevelMiddlewares = this.getControllerLevelMiddlewares(controllerMetadata);
    const controllerLevelGuards = this.getControllerLevelGuards(controllerMetadata);

    for (const httpMethodMetadata of controllerMetadata.httpMethods) {
      const instanceMethod = httpMethodMetadata.instanceMethod;
      this.logger?.debug(`instanceMethod: ${instanceMethod}`);

      const httpMethod = httpMethodMetadata.httpMethod;
      this.logger?.debug(`httpMethod: ${httpMethod}`);

      const path = new ExpressPathNormalizer(httpMethodMetadata.path).normalize();
      this.logger?.debug(`path: ${path}`);

      const methodLevelMiddlewares = this.getMethodLevelMiddlewares(httpMethodMetadata);
      const methodLevelGuards = this.getMethodLevelGuards(httpMethodMetadata);

      const expressRequestHandler: ExpressRequestHandler = async (req, res) => {
        this.logger?.debug(`Incoming request: ${req.method} ${req.path}`);

        if (req.params) {
          this.logger?.debug(`params: ${req.params}`);
        }

        if (req.query) {
          this.logger?.debug(`query: ${req.query}`);
        }

        if (req.body) {
          this.logger?.debug(`body: ${req.body}`);
        }

        const result = await (this.controller as any)[instanceMethod](req, res);
        ResponseAdapter.fromThomasToExpress(res, result);
      };

      router[httpMethod](path, [
        ...controllerLevelMiddlewares,
        ...controllerLevelGuards,
        ...methodLevelMiddlewares,
        ...methodLevelGuards,
        expressRequestHandler,
      ]);
    }

    return router;
  }

  private getControllerLevelMiddlewares(
    metadata: ControllerMetadata<Controller>
  ): ExpressMiddlewareHandler[] {
    return (metadata.middlewares ?? []).map((middleware) => {
      const middlewareToAdapt = MiddlewareFactoryAdapter.isFactory(middleware)
        ? new MiddlewareFactoryAdapter({
            container: this.container,
            factory: middleware,
            logger: this.logger,
          }).adapt()
        : middleware;

      return new MiddlewareAdapter({
        container: this.container,
        middleware: middlewareToAdapt,
        logger: this.logger,
      }).adapt();
    });
  }

  private getControllerLevelGuards(
    metadata: ControllerMetadata<Controller>
  ): ExpressMiddlewareHandler[] {
    return (metadata.guards ?? []).map(GuardAdapter.toExpress);
  }

  private getMethodLevelMiddlewares(metadata: HttpMethodMetadata): ExpressMiddlewareHandler[] {
    return (metadata.middlewares ?? []).map((middleware) => {
      return new MiddlewareAdapter({
        container: this.container,
        middleware,
        logger: this.logger,
      }).adapt();
    });
  }

  private getMethodLevelGuards(metadata: HttpMethodMetadata): ExpressMiddlewareHandler[] {
    return (metadata.guards ?? []).map(GuardAdapter.toExpress);
  }
}
