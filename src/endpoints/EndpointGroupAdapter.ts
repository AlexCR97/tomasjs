import { HttpMethod } from "@/core";
import { Router } from "express";
import { container } from "tsyringe";
import { constructor } from "tsyringe/dist/typings/types";
import { Endpoint } from "./Endpoint";
import { EndpointAdapter } from "./EndpointAdapter";
import { EndpointGroup } from "./EndpointGroup";

export abstract class EndpointGroupAdapter {
  private constructor() {}

  static toExpressRouter(endpointGroup: EndpointGroup): { routerBasePath: string; router: Router } {
    const router = Router();
    const endpointsBasePath = endpointGroup._basePath;
    const routerBasePath =
      endpointsBasePath !== undefined && endpointsBasePath.trim().length > 0
        ? endpointsBasePath
        : "/";

    endpointGroup.endpoints.forEach((endpoint) => {
      const endpointMethod = this.getEndpointMethod(endpoint);
      const endpointPath = this.getEndpointPath(endpoint);
      const expressHandlers = EndpointAdapter.fromThomasToExpress(endpoint);
      router[endpointMethod](endpointPath, ...expressHandlers);
    });

    return { routerBasePath, router };
  }

  private static getEndpointMethod(endpoint: Endpoint | constructor<Endpoint>): HttpMethod {
    const endpointInstance = endpoint instanceof Endpoint ? endpoint : container.resolve(endpoint);
    return endpointInstance._method;
  }

  private static getEndpointPath(endpoint: Endpoint | constructor<Endpoint>): string {
    const endpointInstance = endpoint instanceof Endpoint ? endpoint : container.resolve(endpoint);
    return endpointInstance._path;
  }
}
