import { Controller, ControllerAdapter, ControllerType, isController } from "@/controllers";
import { ControllerMetadata } from "@/controllers/metadata";
import {
  ErrorHandler,
  ErrorHandlerAdapter,
  ErrorHandlerType,
  TomasErrorHandler,
} from "@/error-handler";
import cors from "cors";
import express, { Express } from "express";
import { AbstractApiBuilder } from "./AbstractApiBuilder";
import { EndpointGroupBuilder } from "./EndpointGroupBuilder";
import { EndpointGroupBuilderFunction } from "./EndpointGroupBuilderFunction";
import { ExpressPathAdapter } from "@/core/express";
import { Configuration, ConfigurationResolver, globalContainer } from "@tomasjs/core";

interface IAppBuilder extends AbstractApiBuilder<IAppBuilder> {
  getConfiguration<TSettings extends object>(): Configuration<TSettings>;

  use(appSetup: (app: Express) => void): IAppBuilder;

  useCors<T extends cors.CorsRequest = cors.CorsRequest>(
    options?: cors.CorsOptions | cors.CorsOptionsDelegate<T>
  ): IAppBuilder;

  /* #region Formatters */
  useText(options?: any): IAppBuilder; // TODO Figure out how to pass type parameter
  useJson(options?: any): IAppBuilder; // TODO Figure out how to pass type parameter
  /* #endregion */

  useEndpointGroup(endpoints: EndpointGroupBuilderFunction): IAppBuilder;

  useErrorHandler<THandler extends ErrorHandler = ErrorHandler>(
    handler: ErrorHandlerType<THandler>
  ): IAppBuilder;

  useController<TController extends object = object>(
    controller: ControllerType<TController>
  ): IAppBuilder;

  // TODO Add return type for server
  buildAsync(port: number): Promise<any>;
}

export class AppBuilder extends AbstractApiBuilder<IAppBuilder> implements IAppBuilder {
  protected override root = express();

  getConfiguration<TSettings extends object>(): Configuration<TSettings> {
    return new ConfigurationResolver().getConfiguration<TSettings>();
  }

  use(appSetup: (app: Express) => void): IAppBuilder {
    appSetup(this.root);
    return this;
  }

  useCors<T extends cors.CorsRequest = cors.CorsRequest>(
    options?: cors.CorsOptions | cors.CorsOptionsDelegate<T>
  ): IAppBuilder {
    const corsMiddleware = cors(options as any); // TODO Improve typing
    this.root.use(corsMiddleware);
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

  /* #region Controllers */

  private readonly controllers: ControllerType[] = [];

  useController<TController extends Controller = Controller>(
    controller: ControllerType<TController>
  ): IAppBuilder {
    this.controllers.push(controller);
    return this as any; // TODO Figure out how to satisfy generic
  }

  private bindController<TController extends Controller = Controller>(
    controller: ControllerType<TController>
  ) {
    if (isController<TController>(controller)) {
      return this.bindControllerInstance(controller);
    }

    const controllerInstance = globalContainer.get<TController>(controller);
    return this.bindControllerInstance(controllerInstance);
  }

  private bindControllerInstance(controller: Controller) {
    const controllerMetadata = new ControllerMetadata(controller);
    const expressRouterPath = ExpressPathAdapter.adapt(controllerMetadata.path);
    const expressRouter = new ControllerAdapter(controller).adapt();
    this.root.use(expressRouterPath, expressRouter);
    return this;
  }

  protected tryBindControllers() {
    if (this.controllers.length === 0) {
      return this;
    }

    for (const controller of this.controllers) {
      this.bindController(controller);
    }

    return this;
  }

  /* #endregion */

  /* #region Error Handler */

  private errorHandler: ErrorHandlerType<ErrorHandler> = new TomasErrorHandler();

  useErrorHandler<THandler extends ErrorHandler = ErrorHandler>(
    handler: ErrorHandlerType<THandler>
  ): IAppBuilder {
    this.errorHandler = handler;
    return this;
  }

  private bindErrorHandler<THandler extends ErrorHandler = ErrorHandler>(
    handler: ErrorHandlerType<THandler>
  ) {
    const expressErrorMiddlewareFunction = new ErrorHandlerAdapter(handler).adapt();
    this.root.use(expressErrorMiddlewareFunction);
    return this;
  }

  private tryBindErrorHandler() {
    return this.bindErrorHandler(this.errorHandler);
  }

  /* #endregion */

  // TODO Add return type
  async buildAsync(port: number): Promise<any> {
    return await this.tryBindMiddlewares()
      .tryBindGuards()
      .tryBindEndpoints()
      .tryBindEndpointGroups()
      .tryBindControllers()
      .tryBindErrorHandler()
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
