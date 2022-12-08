import { HttpContextResolver } from "@/core";
import { ExpressRequestHandler } from "@/core/handlers";
import { MiddlewareAdapter, MiddlewareFactory } from "@/middleware";
import { ExpressMiddlewareHandler } from "@/middleware/types";
import { ResponseAdapter } from "@/responses";
import { Request, Response } from "express";
import { container } from "tsyringe";
import { constructor } from "tsyringe/dist/typings/types";
import { Endpoint } from "./Endpoint";
import { EndpointHandler, IsEndpointHandler } from "./types";

export abstract class EndpointAdapter {
  private constructor() {}

  static fromThomasToExpress(
    endpoint: EndpointHandler<any> | Endpoint | constructor<Endpoint>
  ): (ExpressMiddlewareHandler | ExpressRequestHandler)[] {
    if (IsEndpointHandler<any>(endpoint)) {
      return [this.fromTypeToExpress(endpoint)];
    }

    if (endpoint instanceof Endpoint) {
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
    const expressMiddlewareHandlers = endpoint.onBeforeMiddlewares.map((middleware) => {
      return middleware instanceof MiddlewareFactory
        ? MiddlewareAdapter.fromThomasToExpress(middleware.create())
        : MiddlewareAdapter.fromThomasToExpress(middleware);
    });

    const expressRequestHandler = async (req: Request, res: Response) => {
      const context = HttpContextResolver.fromExpress(req, res);
      const result = await endpoint.handle(context);
      ResponseAdapter.fromThomasToExpress(res, result);
    };

    return [...expressMiddlewareHandlers, expressRequestHandler];
  }

  static fromConstructorToExpress(
    endpoint: constructor<Endpoint>
  ): (ExpressMiddlewareHandler | ExpressRequestHandler)[] {
    const endpointInstance = container.resolve(endpoint);

    const expressMiddlewareHandlers = endpointInstance.onBeforeMiddlewares.map((middleware) => {
      return middleware instanceof MiddlewareFactory
        ? MiddlewareAdapter.fromThomasToExpress(middleware.create())
        : MiddlewareAdapter.fromThomasToExpress(middleware);
    });

    const expressRequestHandler = async (req: Request, res: Response) => {
      const context = HttpContextResolver.fromExpress(req, res);
      const result = await endpointInstance.handle(context); // TODO Re-resolve for DI?
      ResponseAdapter.fromThomasToExpress(res, result);
    };

    return [...expressMiddlewareHandlers, expressRequestHandler];
  }
}
