import { ClassConstructor, internalContainer } from "@/container";
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
import { ControllerMetadata } from "./metadata";

/**
 * Adapts a Tomas Controller into an Express Router
 */
export class ControllerAdapter<TController extends Controller> {
  constructor(private readonly controller: ControllerType<TController>) {}

  adapt(): Router {
    if (isController<TController>(this.controller)) {
      return this.fromInstance(this.controller);
    }

    return this.fromConstructor(this.controller);
  }

  private fromInstance(controller: TController): Router {
    const router = Router();
    const controllerMetadata = new ControllerMetadata(controller);

    for (const httpMethodMetadata of controllerMetadata.httpMethods) {
      const instanceMethod = httpMethodMetadata.instanceMethod;
      // console.log("instanceMethod", instanceMethod);

      const httpMethod = httpMethodMetadata.httpMethod;
      // console.log("httpMethod", httpMethod);

      const path = ExpressPathAdapter.adapt(httpMethodMetadata.path);
      // console.log("path", path);

      const expressMiddlewares: ExpressMiddlewareHandler[] = (
        controllerMetadata.middlewares ?? []
      ).map((middleware) => {
        const middlewareToAdapt = MiddlewareFactoryAdapter.isFactory(middleware)
          ? MiddlewareFactoryAdapter.from(middleware)
          : middleware;
        return MiddlewareAdapter.from(middlewareToAdapt);
      });

      const guardExpressMiddlewares: ExpressMiddlewareHandler[] = (
        controllerMetadata.guards ?? []
      ).map((guard) => {
        return GuardAdapter.toExpress(guard);
      });

      const expressRequestHandler: ExpressRequestHandler = async (req, res) => {
        const result = await (controller as any)[instanceMethod](req, res);
        ResponseAdapter.fromThomasToExpress(res, result);
      };

      router[httpMethod](path, [
        ...expressMiddlewares,
        ...guardExpressMiddlewares,
        expressRequestHandler,
      ]);
    }

    return router;
  }

  private fromConstructor(controller: ClassConstructor<TController>): Router {
    const registeredController = internalContainer.get<TController>(controller);
    return this.fromInstance(registeredController);
  }
}
