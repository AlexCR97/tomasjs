import {
  ExpressMiddlewareHandler,
  ExpressPathAdapter,
  ExpressRequestHandler,
} from "@/core/express";
import { GuardAdapter } from "@/guards";
import { MiddlewareAdapter, MiddlewareFactoryAdapter } from "@/middleware";
import { ResponseAdapter } from "@/responses";
import { Router } from "express";
import { Controller } from "./Controller";
import { ControllerType } from "./ControllerType";
import { isController } from "./isController";
import { ControllerMetadata, HttpMethodMetadata } from "./metadata";
import { ClassConstructor, Container, NotImplementedError } from "@tomasjs/core";

/**
 * Adapts a Controller to an Express Router.
 * @template TController - The type of the Tomas controller.
 */
export class ControllerAdapter<TController extends Controller> {
  constructor(private readonly controller: ControllerType<TController>) {}

  private get container(): Container {
    throw new NotImplementedError("get container"); // TODO Implement
  }

  /**
   * Adapts the controller to an Express Router.
   * @returns {Router} The adapted router.
   */
  adapt(): Router {
    if (isController<TController>(this.controller)) {
      return this.fromInstance(this.controller);
    }

    return this.fromConstructor(this.controller);
  }

  private fromInstance(controller: TController): Router {
    const router = Router();
    const controllerMetadata = new ControllerMetadata(controller);
    const controllerLevelMiddlewares = this.getControllerLevelMiddlewares(controllerMetadata);
    const controllerLevelGuards = this.getControllerLevelGuards(controllerMetadata);

    for (const httpMethodMetadata of controllerMetadata.httpMethods) {
      const instanceMethod = httpMethodMetadata.instanceMethod;
      // console.log("instanceMethod", instanceMethod);

      const httpMethod = httpMethodMetadata.httpMethod;
      // console.log("httpMethod", httpMethod);

      const path = ExpressPathAdapter.adapt(httpMethodMetadata.path);
      // console.log("path", path);

      const methodLevelMiddlewares = this.getMethodLevelMiddlewares(httpMethodMetadata);
      const methodLevelGuards = this.getMethodLevelGuards(httpMethodMetadata);

      const expressRequestHandler: ExpressRequestHandler = async (req, res) => {
        const result = await (controller as any)[instanceMethod](req, res);
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

  private fromConstructor(controller: ClassConstructor<TController>): Router {
    const registeredController = this.container.get<TController>(controller);
    return this.fromInstance(registeredController);
  }

  private getControllerLevelMiddlewares(
    metadata: ControllerMetadata<TController>
  ): ExpressMiddlewareHandler[] {
    return (metadata.middlewares ?? []).map((middleware) => {
      const middlewareToAdapt = MiddlewareFactoryAdapter.isFactory(middleware)
        ? MiddlewareFactoryAdapter.from(middleware)
        : middleware;
      return MiddlewareAdapter.from(middlewareToAdapt);
    });
  }

  private getControllerLevelGuards(
    metadata: ControllerMetadata<TController>
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
