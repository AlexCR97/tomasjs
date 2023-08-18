import { ClassConstructor } from "@/reflection";
import { Container } from "./Container";
import { ServiceContainerProvider } from "./ServiceContainerProvider";
import { isContainerSetupFactory } from "./ContainerSetupFactory";
import { ContainerSetupType } from "./ContainerSetupType";
import { ServiceProvider } from "./ServiceProvider";
import { Token } from "./Token";
import { Scope } from "./Scope";
import { ServiceContainer } from "./ServiceContainer";
import { ContainerBuilder } from "./ContainerBuilder";
import { serviceProviderToken } from "./serviceProviderToken";

export class ServiceContainerBuilder implements ContainerBuilder {
  private readonly setups: ContainerSetupType[] = [];
  private readonly container = new ServiceContainer();
  private readonly serviceProvider: ServiceProvider;

  constructor() {
    this.serviceProvider = this.registerServiceProvider();
  }

  private registerServiceProvider(): ServiceProvider {
    const serviceProvider = new ServiceContainerProvider(this.container);
    this.container.addInstance(serviceProvider, serviceProviderToken);
    return serviceProvider;
  }

  addClass<T>(
    constructor: ClassConstructor<T>,
    options?: { token?: Token<T>; scope?: Scope }
  ): ServiceContainerBuilder {
    this.container.addClass<T>(constructor, options);
    return this;
  }

  addInstance<T>(instance: T, token: Token<T>): ServiceContainerBuilder {
    this.container.addInstance(instance, token);
    return this;
  }

  setup(setup: ContainerSetupType): ServiceContainerBuilder {
    this.setups.push(setup);
    return this;
  }

  async buildContainerAsync(): Promise<Container> {
    await this.runContainerSetupsAsync();
    return this.container;
  }

  async buildServiceProviderAsync(): Promise<ServiceProvider> {
    await this.runContainerSetupsAsync();
    return this.serviceProvider;
  }

  private async runContainerSetupsAsync() {
    for (const setup of this.setups) {
      const setupFunction = isContainerSetupFactory(setup) ? setup.create() : setup;
      await setupFunction(this.container);
    }
  }
}
