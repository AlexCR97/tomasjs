import { ClassConstructor, internalContainer } from "@/container";
import { HttpContextResolver } from "@/core";
import { ExpressMiddlewareHandler, ExpressRequestHandler } from "@/core/express";
import { MiddlewareAdapter, MiddlewareFactoryAdapter } from "@/middleware";
import { ResponseAdapter } from "@/responses";
import { Request, Response } from "express";
import { Endpoint } from "./Endpoint";
import { isEndpoint } from "./isEndpoint";
import { EndpointMetadataStrategy } from "./metadata";
import { EndpointHandler, IsEndpointHandler } from "./types";

export abstract class EndpointAdapter {
  private constructor() {}

  static fromThomasToExpress(
    endpoint: EndpointHandler<any> | Endpoint | ClassConstructor<Endpoint>
  ): (ExpressMiddlewareHandler | ExpressRequestHandler)[] {
    if (IsEndpointHandler<any>(endpoint)) {
      return [this.fromTypeToExpress(endpoint)];
    }

    if (isEndpoint(endpoint)) {
      return this.fromInstanceToExpress(endpoint);
    }

    return this.fromConstructorToExpress(endpoint);
  }

  static fromTypeToExpress<TResponse>(endpoint: EndpointHandler<TResponse>): ExpressRequestHandler {
    return async (req, res) => {
      const context = HttpContextResolver.fromExpress(req, res);
      const result = await endpoint(context);
      ResponseAdapter.fromThomasToExpress(res, result);
    };
  }

  static fromInstanceToExpress(
    endpoint: Endpoint
  ): (ExpressMiddlewareHandler | ExpressRequestHandler)[] {
    const endpointMetadata = EndpointMetadataStrategy.get(endpoint);
    let expressMiddlewareHandlers: ExpressMiddlewareHandler[] = [];

    if (endpointMetadata.middlewares !== undefined && endpointMetadata.middlewares.length > 0) {
      expressMiddlewareHandlers = endpointMetadata.middlewares.map((middleware) => {
        const middlewareToAdapt = MiddlewareFactoryAdapter.isFactory(middleware)
          ? MiddlewareFactoryAdapter.from(middleware)
          : middleware;
        return MiddlewareAdapter.from(middlewareToAdapt);
      });
    }

    const expressRequestHandler = async (req: Request, res: Response) => {
      // console.log("express handler!");

      // console.log("resolving context...");
      const context = HttpContextResolver.fromExpress(req, res);
      // console.log("context resolved");

      const result = await endpoint.handle(context);
      // console.log("result", result);

      ResponseAdapter.fromThomasToExpress(res, result);
      // console.log("after express handler responded");
    };

    return [...expressMiddlewareHandlers, expressRequestHandler];
  }

  static fromConstructorToExpress(
    endpoint: ClassConstructor<Endpoint>
  ): (ExpressMiddlewareHandler | ExpressRequestHandler)[] {
    const endpointInstance = internalContainer.get(endpoint);
    const endpointMetadata = EndpointMetadataStrategy.get(endpointInstance); // TOOD Pass constructor in here?
    let expressMiddlewareHandlers: ExpressMiddlewareHandler[] = [];

    if (endpointMetadata.middlewares !== undefined && endpointMetadata.middlewares.length > 0) {
      expressMiddlewareHandlers = endpointMetadata.middlewares.map((middleware) => {
        const middlewareToAdapt = MiddlewareFactoryAdapter.isFactory(middleware)
          ? MiddlewareFactoryAdapter.from(middleware)
          : middleware;
        return MiddlewareAdapter.from(middlewareToAdapt);
      });
    }

    const expressRequestHandler = async (req: Request, res: Response) => {
      const context = HttpContextResolver.fromExpress(req, res);
      const result = await endpointInstance.handle(context); // TODO Re-resolve for DI?
      ResponseAdapter.fromThomasToExpress(res, result);
    };

    return [...expressMiddlewareHandlers, expressRequestHandler];
  }
}
