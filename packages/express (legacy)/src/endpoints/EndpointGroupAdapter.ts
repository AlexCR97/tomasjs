import { ExpressPathAdapter } from "@/core/express";
import { GuardAdapter } from "@/guards";
import { MiddlewareAdapter, MiddlewareFactoryAdapter } from "@/middleware";
import { Router } from "express";
import { EndpointAdapter } from "./EndpointAdapter";
import { EndpointGroup } from "./EndpointGroup";
import { EndpointMetadataStrategy } from "./metadata";

export abstract class EndpointGroupAdapter {
  private constructor() {}

  static toExpressRouter(endpointGroup: EndpointGroup): {
    routerBasePath: string;
    router: Router;
  } {
    const router = Router();

    if (
      endpointGroup.onBeforeMiddlewares !== undefined &&
      endpointGroup.onBeforeMiddlewares.length > 0
    ) {
      // TODO Encapsulate this logic into a function? The same logic is used in AppBuilder.useMiddlewarex.
      const expressMiddlewareFunctions = endpointGroup.onBeforeMiddlewares.map(
        (middleware) => {
          const middlewareToAdapt = MiddlewareFactoryAdapter.isFactory(
            middleware
          )
            ? MiddlewareFactoryAdapter.from(middleware)
            : middleware;
          return MiddlewareAdapter.from(middlewareToAdapt);
        }
      );
      router.use(...expressMiddlewareFunctions);
    }

    if (endpointGroup.guards !== undefined && endpointGroup.guards.length > 0) {
      const guardExpressMiddlewareFunctions = endpointGroup.guards.map(
        (guard) => {
          return GuardAdapter.toExpress(guard);
        }
      );
      router.use(...guardExpressMiddlewareFunctions);
    }

    const endpoints = endpointGroup.endpoints ?? [];

    for (const endpoint of endpoints) {
      const metadata = EndpointMetadataStrategy.get(endpoint);
      const endpointMethod = metadata.httpMethodOrDefault;
      const endpointPath = ExpressPathAdapter.adapt(metadata.path);
      const expressHandlers = EndpointAdapter.fromThomasToExpress(endpoint);
      router[endpointMethod](endpointPath, ...expressHandlers);
    }

    return {
      router,
      routerBasePath: ExpressPathAdapter.adapt(endpointGroup._basePath),
    };
  }
}
