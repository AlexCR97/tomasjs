import express, { Express } from "express";
import { ExpressErrorMiddlewareHandler, ExpressPathAdapter } from "../../core/express";
import {
  ErrorMiddlewareAdapter,
  ErrorMiddlewareType,
  isErrorMiddleware,
  isErrorMiddlewareHandler,
} from "../../middleware";
import { AbstractApiBuilder } from "./AbstractApiBuilder";
import { EndpointGroupBuilder } from "./EndpointGroupBuilder";
import { EndpointGroupBuilderFunction } from "./EndpointGroupBuilderFunction";

// TODO Move this interface somewhere else?
interface IAppBuilder extends AbstractApiBuilder<IAppBuilder> {
  use(appSetup: (app: Express) => void): IAppBuilder;

  /* #region Formatters */
  useText(options?: any): IAppBuilder; // TODO Figure out how to pass type parameter
  useJson(options?: any): IAppBuilder; // TODO Figure out how to pass type parameter
  /* #endregion */

  useEndpointGroup(endpoints: EndpointGroupBuilderFunction): IAppBuilder;

  useErrorMiddleware(middleware: ErrorMiddlewareType): IAppBuilder;

  // TODO Add return type for server
  buildAsync(port: number): Promise<any>;
}

export class AppBuilder extends AbstractApiBuilder<IAppBuilder> implements IAppBuilder {
  protected override root = express();

  use(appSetup: (app: Express) => void): IAppBuilder {
    appSetup(this.root);
    return this;
  }

  /* #region Formatters */

  // TODO Figure out how to pass type parameter
  useText(options?: any): IAppBuilder {
    this.root.use(express.text(options));
    return this;
  }

  // TODO Figure out how to pass type parameter
  useJson(options?: any): IAppBuilder {
    this.root.use(express.json(options));
    return this;
  }

  /* #endregion */

  /* #region Endpoint Groups */

  private readonly endpointGroups: EndpointGroupBuilderFunction[] = [];

  useEndpointGroup(endpoints: EndpointGroupBuilderFunction): IAppBuilder {
    this.endpointGroups.push(endpoints);
    return this;
  }

  private bindEndpointGroup(endpointsBuilderFunction: EndpointGroupBuilderFunction) {
    const endpointGroupBuilder = new EndpointGroupBuilder();
    endpointsBuilderFunction(endpointGroupBuilder);

    const routerBasePath = ExpressPathAdapter.adapt(endpointGroupBuilder._basePath);

    const expressRouter = endpointGroupBuilder.build();

    this.root.use(routerBasePath, expressRouter);

    return this;
  }

  protected tryBindEndpointGroups() {
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

  private errorMiddleware?: ErrorMiddlewareType;

  useErrorMiddleware(middleware: ErrorMiddlewareType): IAppBuilder {
    this.errorMiddleware = middleware;
    return this;
  }

  private bindErrorMiddleware(middleware: ErrorMiddlewareType) {
    let expressErrorMiddleware: ExpressErrorMiddlewareHandler;

    if (isErrorMiddlewareHandler(middleware)) {
      expressErrorMiddleware = ErrorMiddlewareAdapter.fromTypeToExpress(middleware);
    } else if (isErrorMiddleware(middleware)) {
      expressErrorMiddleware = ErrorMiddlewareAdapter.fromInstanceToExpress(middleware);
    } else {
      expressErrorMiddleware = ErrorMiddlewareAdapter.fromConstructorToExpress(middleware);
    }

    this.root.use(expressErrorMiddleware);

    return this;
  }

  private tryBindErrorMiddleware() {
    if (this.errorMiddleware === undefined || this.errorMiddleware === null) {
      return this;
    }

    return this.bindErrorMiddleware(this.errorMiddleware);
  }

  /* #endregion */

  // TODO Add return type
  async buildAsync(port: number): Promise<any> {
    return await this.tryBindMiddlewares()
      .tryBindGuards()
      .tryBindEndpoints()
      .tryBindEndpointGroups()
      .tryBindErrorMiddleware()
      .createServerAsync(port);
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
