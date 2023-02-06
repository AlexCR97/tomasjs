import { ClassConstructor, internalContainer } from "@/container";
import { ExpressPathAdapter } from "@/core/express";
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
    console.log("httpMethods.length", controllerMetadata.httpMethods.length);

    for (const httpMethodMetadata of controllerMetadata.httpMethods) {
      const instanceMethod = httpMethodMetadata.instanceMethod;
      console.log("instanceMethod", instanceMethod);

      const httpMethod = httpMethodMetadata.httpMethod;
      console.log("httpMethod", httpMethod);

      const path = ExpressPathAdapter.adapt(httpMethodMetadata.path);
      console.log("path", path);

      router[httpMethod](path, async (req, res) => {
        const result = await (controller as any)[instanceMethod]();
        ResponseAdapter.fromThomasToExpress(res, result);
      });
    }

    return router;
  }

  private fromConstructor(controller: ClassConstructor<TController>): Router {
    const registeredController = internalContainer.get<TController>(controller);
    return this.fromInstance(registeredController);
  }
}
