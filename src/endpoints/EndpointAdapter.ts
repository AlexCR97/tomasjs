import { ClassConstructor, internalContainer } from "@/container";
import { HttpContextResolver } from "@/core";
import { ExpressMiddlewareHandler, ExpressRequestHandler } from "@/core/express";
import { MiddlewareAdapter, MiddlewareFactoryAdapter } from "@/middleware";
import { ResponseAdapter } from "@/responses";
import { Request, Response } from "express";
import { Endpoint } from "./Endpoint";
import { EndpointMetadata } from "./EndpointMetadata";
import { isEndpoint } from "./isEndpoint";
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
    const endpointMetadata = new EndpointMetadata(endpoint);
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
      const result = await endpoint.handle(context);
      ResponseAdapter.fromThomasToExpress(res, result);
    };

    return [...expressMiddlewareHandlers, expressRequestHandler];
  }

  static fromConstructorToExpress(
    endpoint: ClassConstructor<Endpoint>
  ): (ExpressMiddlewareHandler | ExpressRequestHandler)[] {
    const endpointInstance = internalContainer.get(endpoint);
    const endpointMetadata = new EndpointMetadata(endpointInstance);
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
