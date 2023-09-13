import {
  ExpressMiddlewareFunction,
  ExpressPathNormalizer,
  ExpressRequestHandler,
} from "@/core/express";
import { MiddlewareAdapter } from "@/middleware";
import { Router } from "express";
import { Controller } from "./Controller";
import { ControllerMetadata, HttpMethodMetadata } from "./metadata";
import { Container, TomasError, TomasLogger } from "@tomasjs/core";
import { GuardAdapter } from "@/guards";
import { HttpMethod, httpResponseFactory } from "@/core";
import { InterceptorAdapter } from "@/interceptors";

/**
 * Adapts a Controller to an Express Router.
 */
export class ControllerAdapter {
  private readonly logger = new TomasLogger(ControllerAdapter.name, "error");

  constructor(private readonly controller: Controller, private readonly container: Container) {}

  adapt(): Router {
    const router = Router();
    const controllerMetadata = new ControllerMetadata(this.controller);
    const controllerLevelMiddlewares = this.getControllerLevelMiddlewares(controllerMetadata);
    const controllerLevelInterceptors = this.getControllerLevelInterceptors(controllerMetadata);
    const controllerLevelGuards = this.getControllerLevelGuards(controllerMetadata);

    for (const httpMethodMetadata of controllerMetadata.httpMethods) {
      const instanceMethod = httpMethodMetadata.instanceMethod;
      this.logger?.debug(`instanceMethod: ${instanceMethod}`);

      const httpMethod = httpMethodMetadata.httpMethod;
      this.logger?.debug(`httpMethod: ${httpMethod}`);

      const path = new ExpressPathNormalizer(httpMethodMetadata.path).normalize();
      this.logger?.debug(`path: ${path}`);

      const methodLevelMiddlewares = this.getMethodLevelMiddlewares(httpMethodMetadata);
      const methodLevelInterceptors = this.getMethodLevelInterceptors(httpMethodMetadata);
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

      this.bindRequestHandlers(router, httpMethod, path, [
        ...controllerLevelMiddlewares,
        ...controllerLevelInterceptors,
        ...controllerLevelGuards,
        ...methodLevelMiddlewares,
        ...methodLevelInterceptors,
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

  private getControllerLevelInterceptors(
    metadata: ControllerMetadata<Controller>
  ): ExpressMiddlewareFunction[] {
    const interceptors = metadata.interceptors ?? [];

    return interceptors.map((interceptor) => {
      const adapter = new InterceptorAdapter(this.container, interceptor);
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

  private getMethodLevelInterceptors(metadata: HttpMethodMetadata): ExpressMiddlewareFunction[] {
    const interceptors = metadata.interceptors ?? [];

    return interceptors.map((interceptor) => {
      const adapter = new InterceptorAdapter(this.container, interceptor);
      return adapter.adapt();
    });
  }

  private getMethodLevelGuards(metadata: HttpMethodMetadata): ExpressMiddlewareFunction[] {
    return (metadata.guards ?? []).map((guard) => {
      return new GuardAdapter({ container: this.container, guard }).adapt();
    });
  }

  private bindRequestHandlers(
    router: Router,
    method: HttpMethod,
    path: string,
    handlers: ExpressMiddlewareFunction[]
  ) {
    if (method === "get") {
      return router.get(path, ...handlers);
    }

    if (method === "post") {
      return router.post(path, ...handlers);
    }

    if (method === "put") {
      return router.put(path, ...handlers);
    }

    if (method === "patch") {
      return router.patch(path, ...handlers);
    }

    if (method === "delete") {
      return router.delete(path, ...handlers);
    }

    throw new TomasError(`Unknown HttpMethod "${method}"`, { data: { method } });
  }
}
