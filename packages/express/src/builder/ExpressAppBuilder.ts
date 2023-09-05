import express, { Express } from "express";
import { Server } from "http";
import { AppSetupType } from "./AppSetupType";
import { IExpressAppBuilder } from "./IExpressAppBuilder";
import { AppSetupFunction } from "./AppSetupFunction";
import { AppSetupFactory, isAppSetupFactory } from "./AppSetupFactory";
import { Container, Logger, ServiceContainer } from "@tomasjs/core";
import { useCorePipeline } from "./useCorePipeline";

export class ExpressAppBuilder implements IExpressAppBuilder {
  private readonly app: Express;
  private readonly port: number;
  private readonly defaultPort = 3000;
  private readonly container: Container;
  private readonly setups: AppSetupType[] = [];

  constructor(options?: { app?: Express; port?: number; container?: Container; logger?: Logger }) {
    this.app = options?.app ?? express();
    this.port = options?.port ?? this.defaultPort;
    this.container = options?.container ?? new ServiceContainer();
    this.setups.push(useCorePipeline);
  }

  use(setup: AppSetupType): IExpressAppBuilder {
    this.setups.push(setup);
    return this;
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
