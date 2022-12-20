import { ClassConstructor, internalContainer } from "@/container";
import { HttpMethod } from "@/core";
import { MiddlewareAdapter, MiddlewareFactoryAdapter } from "@/middleware";
import { Router } from "express";
import { Endpoint } from "./Endpoint";
import { EndpointAdapter } from "./EndpointAdapter";
import { EndpointGroup } from "./EndpointGroup";

export abstract class EndpointGroupAdapter {
  private constructor() {}

  static toExpressRouter(endpoints: EndpointGroup): { routerBasePath: string; router: Router } {
    const router = Router();

    if (endpoints.onBeforeMiddlewares !== undefined && endpoints.onBeforeMiddlewares.length > 0) {
      // TODO Encapsulate this logic into a function? The same logic is used in AppBuilder.useMiddlewarex.
      const expressMiddlewareHandlers = endpoints.onBeforeMiddlewares.map((middleware) => {
        const middlewareToAdapt = MiddlewareFactoryAdapter.isFactory(middleware)
          ? MiddlewareFactoryAdapter.from(middleware)
          : middleware;
        return MiddlewareAdapter.from(middlewareToAdapt);
      });
      router.use(...expressMiddlewareHandlers);
    }

    if (endpoints.endpoints !== undefined && endpoints.endpoints.length > 0) {
      endpoints.endpoints.forEach((endpoint) => {
        const endpointMethod = this.getEndpointMethod(endpoint);
        const endpointPath = this.getEndpointPath(endpoint);
        const expressHandlers = EndpointAdapter.fromThomasToExpress(endpoint);
        router[endpointMethod](endpointPath, ...expressHandlers);
      });
    }

    return {
      router,
      routerBasePath:
        endpoints._basePath !== undefined && endpoints._basePath.trim().length > 0
          ? endpoints._basePath
          : "/",
    };
  }

  private static getEndpointMethod(endpoint: Endpoint | ClassConstructor<Endpoint>): HttpMethod {
    const endpointInstance =
      endpoint instanceof Endpoint ? endpoint : internalContainer.get(endpoint);
    return endpointInstance._method;
  }

  private static getEndpointPath(endpoint: Endpoint | ClassConstructor<Endpoint>): string {
    const endpointInstance =
      endpoint instanceof Endpoint ? endpoint : internalContainer.get(endpoint);
    return endpointInstance._path;
  }
}
