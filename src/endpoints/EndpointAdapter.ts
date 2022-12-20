import { container } from "tsyringe";
import { constructor } from "tsyringe/dist/typings/types";
import { HttpContextResolver } from "@/core";
import { ExpressMiddlewareHandler, ExpressRequestHandler } from "@/core/express";
import { MiddlewareAdapter, MiddlewareFactoryAdapter } from "@/middleware";
import { ResponseAdapter } from "@/responses";
import { Request, Response } from "express";
import { Endpoint } from "./Endpoint";
import { EndpointHandler, IsEndpointHandler } from "./types";
import { IEndpoint } from "./IEndpoint";

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
      console.log("express!");
      const context = HttpContextResolver.fromExpress(req, res);
      console.log("runtime context", context);
      const result = await endpoint(context);
      console.log("result", result);
      ResponseAdapter.fromThomasToExpress(res, result);
    };
  }

  static fromInstanceToExpress(
    endpoint: Endpoint
  ): (ExpressMiddlewareHandler | ExpressRequestHandler)[] {
    const expressMiddlewareHandlers = endpoint.onBeforeMiddlewares.map((middleware) => {
      const middlewareToAdapt = MiddlewareFactoryAdapter.isFactory(middleware)
        ? MiddlewareFactoryAdapter.from(middleware)
        : middleware;
      return MiddlewareAdapter.from(middlewareToAdapt);
    });

    const expressRequestHandler = async (req: Request, res: Response) => {
      const context = HttpContextResolver.fromExpress(req, res);
      const result = await endpoint.handle(context);
      ResponseAdapter.fromThomasToExpress(res, result);
    };

    return [...expressMiddlewareHandlers, expressRequestHandler];
  }

  static fromInstanceToExpressx<TEndpoint extends object>(
    endpoint: TEndpoint
  ): (ExpressMiddlewareHandler | ExpressRequestHandler)[] {
    const expressRequestHandler = async (req: Request, res: Response) => {
      console.log("express handler");

      HttpContextResolver.fromExpress(req, res);
      console.log("after HttpContextResolver");

      const result = await (endpoint as IEndpoint).handle();
      console.log("result", result);

      ResponseAdapter.fromThomasToExpress(res, result);
    };

    return [expressRequestHandler];
  }

  static fromConstructorToExpress(
    endpoint: constructor<Endpoint>
  ): (ExpressMiddlewareHandler | ExpressRequestHandler)[] {
    const endpointInstance = container.resolve(endpoint);

    const expressMiddlewareHandlers = endpointInstance.onBeforeMiddlewares.map((middleware) => {
      const middlewareToAdapt = MiddlewareFactoryAdapter.isFactory(middleware)
        ? MiddlewareFactoryAdapter.from(middleware)
        : middleware;
      return MiddlewareAdapter.from(middlewareToAdapt);
    });

    const expressRequestHandler = async (req: Request, res: Response) => {
      const context = HttpContextResolver.fromExpress(req, res);
      const result = await endpointInstance.handle(context); // TODO Re-resolve for DI?
      ResponseAdapter.fromThomasToExpress(res, result);
    };

    return [...expressMiddlewareHandlers, expressRequestHandler];
  }
}
