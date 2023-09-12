import {
  ExpressMiddlewareFunction,
  ExpressPathNormalizer,
  ExpressRequestHandler,
} from "@/core/express";
import { MiddlewareAdapter } from "@/middleware";
import { Router } from "express";
import { Controller } from "./Controller";
import { ControllerMetadata, HttpMethodMetadata } from "./metadata";
import { Container, Logger } from "@tomasjs/core";
import { GuardAdapter } from "@/guards";
import { httpResponseFactory } from "@/core";

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
        const response = httpResponseFactory(res);
        response.send(result);
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
  ): ExpressMiddlewareFunction[] {
    const middlewares = metadata.middlewares ?? [];

    return middlewares.map((middleware) => {
      const adapter = new MiddlewareAdapter({
        container: this.container,
        middleware,
      });

      return adapter.adapt();
    });
  }

  private getControllerLevelGuards(
    metadata: ControllerMetadata<Controller>
  ): ExpressMiddlewareFunction[] {
    return (metadata.guards ?? []).map((guard) => {
      return new GuardAdapter({ container: this.container, guard }).adapt();
    });
  }

  private getMethodLevelMiddlewares(metadata: HttpMethodMetadata): ExpressMiddlewareFunction[] {
    const middlewares = metadata.middlewares ?? [];

    return middlewares.map((middleware) => {
      const adapter = new MiddlewareAdapter({
        container: this.container,
        middleware,
      });

      return adapter.adapt();
    });
  }

  private getMethodLevelGuards(metadata: HttpMethodMetadata): ExpressMiddlewareFunction[] {
    return (metadata.guards ?? []).map((guard) => {
      return new GuardAdapter({ container: this.container, guard }).adapt();
    });
  }
}
