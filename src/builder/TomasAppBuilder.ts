import {
  ExpressErrorMiddlewareHandler,
  ExpressPathAdapter,
} from "@/core/express";
import {
  ErrorMiddlewareAdapter,
  ErrorMiddlewareType,
  isErrorMiddleware,
  isErrorMiddlewareHandler,
} from "@/middleware";
import express from "express";
import { AbstractApiBuilder } from "./AbstractApiBuilder";
import { ApiBuilder } from "./ApiBuilder";
import { EndpointGroupBuilder } from "./EndpointGroupBuilder";
import { EndpointGroupBuilderFunction } from "./EndpointGroupBuilderFunction";

// TODO Move this interface somewhere else?
interface ITomasAppBuilder extends ApiBuilder {
  // TODO Add return type for server
  buildAsync(port: number): Promise<any>;
}

export class TomasAppBuilder
  extends AbstractApiBuilder
  implements ITomasAppBuilder
{
  protected override root = express();
  private readonly endpointGroups: EndpointGroupBuilderFunction[] = [];
  private errorMiddleware?: ErrorMiddlewareType;

  /* #region Endpoint Groups */

  useEndpointGroup(endpoints: EndpointGroupBuilderFunction): TomasAppBuilder {
    this.endpointGroups.push(endpoints);
    return this;
  }

  private bindEndpointGroup(
    endpointsBuilderFunction: EndpointGroupBuilderFunction
  ): AbstractApiBuilder {
    const endpointGroupBuilder = new EndpointGroupBuilder();
    endpointsBuilderFunction(endpointGroupBuilder);

    const expressRouter = endpointGroupBuilder.build();

    const routerBasePath = ExpressPathAdapter.adapt(
      endpointGroupBuilder._basePath
    );

    this.root.use(routerBasePath, expressRouter);

    return this;
  }

  protected tryBindEndpointGroups(): AbstractApiBuilder {
    if (this.endpointGroups.length === 0) {
      return this;
    }

    for (const endpointGroup of this.endpointGroups) {
      this.bindEndpointGroup(endpointGroup);
    }

    return this;
  }

  /* #endregion */

  /* #region ErrorMiddleware */

  useErrorMiddleware(middleware: ErrorMiddlewareType): TomasAppBuilder {
    this.errorMiddleware = middleware;
    return this;
  }

  private bindErrorMiddleware(
    middleware: ErrorMiddlewareType
  ): TomasAppBuilder {
    let expressErrorMiddleware: ExpressErrorMiddlewareHandler;

    if (isErrorMiddlewareHandler(middleware)) {
      expressErrorMiddleware =
        ErrorMiddlewareAdapter.fromTypeToExpress(middleware);
    } else if (isErrorMiddleware(middleware)) {
      expressErrorMiddleware =
        ErrorMiddlewareAdapter.fromInstanceToExpress(middleware);
    } else {
      expressErrorMiddleware =
        ErrorMiddlewareAdapter.fromConstructorToExpress(middleware);
    }

    this.root.use(expressErrorMiddleware);

    return this;
  }

  private tryBindErrorMiddleware(): TomasAppBuilder {
    if (this.errorMiddleware === undefined || this.errorMiddleware === null) {
      return this;
    }

    return this.bindErrorMiddleware(this.errorMiddleware);
  }

  /* #endregion */

  // TODO Add return type
  async buildAsync(port: number): Promise<any> {
    this.tryBindMiddlewares();
    this.tryBindEndpoints();
    this.tryBindEndpointGroups();
    this.tryBindErrorMiddleware();
    return await this.createServerAsync(port);
  }

  // TODO Add return type
  private async createServerAsync(port: number): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      const server = this.root
        .listen(port, () => {
          return resolve(server);
        })
        .on("error", (err) => {
          return reject(err);
        });
    });
  }
}
