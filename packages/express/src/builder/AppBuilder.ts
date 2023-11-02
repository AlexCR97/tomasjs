import express, { Express } from "express";
import { Server } from "http";
import { AppSetupType } from "./AppSetupType";
import { AppSetupFunction } from "./AppSetupFunction";
import { AppSetupFactory, isAppSetupFactory } from "./AppSetupFactory";
import { ClassConstructor, Container, Logger, ServiceContainer } from "@tomasjs/core";
import { useCorePipeline } from "./useCorePipeline";
import { HttpMethod } from "@/core";
import { EndpointFunction, EndpointOptions, endpoint } from "@/endpoints";
import { Controller, UseControllers, UseFiles, UseFilesOptions } from "@/controllers";
import { MiddlewareType, UseMiddlewares } from "@/middleware";
import { InterceptorType, UseInterceptors } from "@/interceptors";
import { GuardType, UseGuards } from "@/guards";
import {
  AuthenticationOptions,
  AuthenticationOptionsConfiguration,
  AuthenticationSchemeEntry,
  AuthorizationOptions,
  AuthorizationOptionsConfiguration,
  UseAuthentication,
  UseAuthenticationOptions,
  UseAuthorization,
  UseAuthorizationOptions,
} from "@/auth";
import { UseJson, UseJsonOptions } from "./UseJson";
import { ErrorHandlerType, UseErrorHandler } from "@/error-handler";
import { UseCors, UseCorsOptions } from "./UseCors";
import { Policy } from "@/auth/policies";

export interface IAppBuilder {
  use(setup: AppSetupType): IAppBuilder;

  useCors(options?: UseCorsOptions): IAppBuilder;

  useJson(options?: UseJsonOptions): IAppBuilder;

  useFiles(options?: UseFilesOptions): IAppBuilder;

  useEndpoint(
    method: HttpMethod,
    path: string,
    func: EndpointFunction,
    options?: EndpointOptions
  ): IAppBuilder;
  useGet(path: string, func: EndpointFunction, options?: EndpointOptions): IAppBuilder;
  usePost(path: string, func: EndpointFunction, options?: EndpointOptions): IAppBuilder;
  usePut(path: string, func: EndpointFunction, options?: EndpointOptions): IAppBuilder;
  useDelete(path: string, func: EndpointFunction, options?: EndpointOptions): IAppBuilder;
  usePatch(path: string, func: EndpointFunction, options?: EndpointOptions): IAppBuilder;

  useControllers(...controllers: ClassConstructor<Controller>[]): IAppBuilder;

  useMiddlewares(...middlewares: MiddlewareType[]): IAppBuilder;

  useInterceptors(...interceptors: InterceptorType[]): IAppBuilder;

  useGuards(...guards: GuardType[]): IAppBuilder;

  useAuthentication(schemes: AuthenticationSchemeEntry[]): IAppBuilder;
  useAuthentication(options: AuthenticationOptions): IAppBuilder;
  useAuthentication(configure: AuthenticationOptionsConfiguration): IAppBuilder;
  useAuthentication(options: UseAuthenticationOptions): IAppBuilder;

  useAuthorization(policies: Policy[]): IAppBuilder;
  useAuthorization(options: AuthorizationOptions): IAppBuilder;
  useAuthorization(configure: AuthorizationOptionsConfiguration): IAppBuilder;
  useAuthorization(options: UseAuthorizationOptions): IAppBuilder;

  useErrorHandler(errorHandler: ErrorHandlerType): IAppBuilder;

  buildAsync(): Promise<Server>;
}

export interface AppBuilderOptions {
  app?: Express;
  port?: number;
  container?: Container;
  logger?: Logger;
}

export class AppBuilder implements IAppBuilder {
  private readonly app: Express;
  private readonly port: number;
  private readonly defaultPort = 3000;
  private readonly container: Container;
  private readonly setups: AppSetupType[] = [];

  constructor(options?: AppBuilderOptions) {
    this.app = options?.app ?? express();
    this.port = options?.port ?? this.defaultPort;
    this.container = options?.container ?? new ServiceContainer();
    this.use(useCorePipeline);
  }

  use(setup: AppSetupType): IAppBuilder {
    this.setups.push(setup);
    return this;
  }

  useCors(options?: UseCorsOptions): IAppBuilder {
    return this.use(new UseCors(options));
  }

  useJson(options?: UseJsonOptions): IAppBuilder {
    return this.use(new UseJson(options));
  }

  useFiles(options?: UseFilesOptions): IAppBuilder {
    return this.use(new UseFiles(options));
  }

  /* #region Endpoints */

  useEndpoint(
    method: HttpMethod,
    path: string,
    func: EndpointFunction,
    options?: EndpointOptions
  ): IAppBuilder {
    return this.use(endpoint(method, path, func, options));
  }

  useGet(path: string, func: EndpointFunction, options?: EndpointOptions): IAppBuilder {
    return this.useEndpoint("get", path, func, options);
  }

  usePost(path: string, func: EndpointFunction, options?: EndpointOptions): IAppBuilder {
    return this.useEndpoint("post", path, func, options);
  }

  usePut(path: string, func: EndpointFunction, options?: EndpointOptions): IAppBuilder {
    return this.useEndpoint("put", path, func, options);
  }

  useDelete(path: string, func: EndpointFunction, options?: EndpointOptions): IAppBuilder {
    return this.useEndpoint("delete", path, func, options);
  }

  usePatch(path: string, func: EndpointFunction, options?: EndpointOptions): IAppBuilder {
    return this.useEndpoint("patch", path, func, options);
  }

  /* #endregion */

  useControllers(...controllers: ClassConstructor<Controller>[]): IAppBuilder {
    return this.use(
      new UseControllers({
        controllers,
      })
    );
  }

  useMiddlewares(...middlewares: MiddlewareType[]): IAppBuilder {
    return this.use(
      new UseMiddlewares({
        middlewares,
      })
    );
  }

  useInterceptors(...interceptors: InterceptorType[]): IAppBuilder {
    return this.use(
      new UseInterceptors({
        interceptors,
      })
    );
  }

  useGuards(...guards: GuardType[]): IAppBuilder {
    return this.use(
      new UseGuards({
        guards,
      })
    );
  }

  useAuthentication(schemes: AuthenticationSchemeEntry[]): IAppBuilder;
  useAuthentication(options: AuthenticationOptions): IAppBuilder;
  useAuthentication(configure: AuthenticationOptionsConfiguration): IAppBuilder;
  useAuthentication(options: UseAuthenticationOptions): IAppBuilder;
  useAuthentication(arg1: any): IAppBuilder {
    return this.use(new UseAuthentication(arg1));
  }

  useAuthorization(policies: Policy[]): IAppBuilder;
  useAuthorization(options: AuthorizationOptions): IAppBuilder;
  useAuthorization(configure: AuthorizationOptionsConfiguration): IAppBuilder;
  useAuthorization(options: UseAuthorizationOptions): IAppBuilder;
  useAuthorization(arg1: any): IAppBuilder {
    return this.use(new UseAuthorization(arg1));
  }

  useErrorHandler(errorHandler: ErrorHandlerType): IAppBuilder {
    return this.use(
      new UseErrorHandler({
        errorHandler,
      })
    );
  }

  async buildAsync(): Promise<Server> {
    await this.bootstrapSetupsAsync();
    return await this.startServerAsync();
  }

  private async bootstrapSetupsAsync(): Promise<void> {
    for (const setup of this.setups) {
      if (isAppSetupFactory(setup)) {
        await this.bootstrapSetupFactoryAsync(setup);
      } else {
        await this.bootstrapSetupFunctionAsync(setup);
      }
    }
  }

  private async bootstrapSetupFunctionAsync(setup: AppSetupFunction): Promise<void> {
    await setup(this.app, this.container);
  }

  private async bootstrapSetupFactoryAsync(setup: AppSetupFactory): Promise<void> {
    const setupFunction = setup.create();
    await this.bootstrapSetupFunctionAsync(setupFunction);
  }

  private async startServerAsync(): Promise<Server> {
    return new Promise((resolve, reject) => {
      const server = this.app
        .listen(this.port, () => {
          return resolve(server);
        })
        .on("error", (err) => {
          return reject(err);
        });
    });
  }
}
