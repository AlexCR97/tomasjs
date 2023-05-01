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

/**
 * Adapts a Controller to an Express Router.
 */
export class ControllerAdapter {
  constructor(
    private readonly options: {
      controller: Controller;
      logger?: Logger;
    }
  ) {}

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
        ? MiddlewareFactoryAdapter.from(middleware)
        : middleware;
      return MiddlewareAdapter.from(middlewareToAdapt);
    });
  }

  private getControllerLevelGuards(
    metadata: ControllerMetadata<Controller>
  ): ExpressMiddlewareHandler[] {
    return (metadata.guards ?? []).map(GuardAdapter.toExpress);
  }

  private getMethodLevelMiddlewares(metadata: HttpMethodMetadata): ExpressMiddlewareHandler[] {
    return (metadata.middlewares ?? []).map((middleware) => {
      // TODO Add support for MiddlewareFactories
      return MiddlewareAdapter.from(middleware as any); // TODO Improve type check
    });
  }

  private getMethodLevelGuards(metadata: HttpMethodMetadata): ExpressMiddlewareHandler[] {
    return (metadata.guards ?? []).map(GuardAdapter.toExpress);
  }
}
