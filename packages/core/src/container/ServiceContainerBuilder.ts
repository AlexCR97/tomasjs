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

export class ServiceContainerBuilder implements ContainerBuilder {
  private readonly setups: ContainerSetupType[] = [];
  private readonly container = new ServiceContainer();

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

  async buildAsync(): Promise<void> {
    await this.setupServicesAsync();
  }

  async buildContainerAsync(): Promise<Container> {
    await this.setupServicesAsync();
    return this.container;
  }

  async buildServiceProviderAsync(): Promise<ServiceProvider> {
    await this.setupServicesAsync();
    return new ServiceContainerProvider(this.container);
  }

  private async setupServicesAsync() {
    for (const setup of this.setups) {
      const setupFunction = isContainerSetupFactory(setup) ? setup.create() : setup;
      await setupFunction(this.container);
    }
  }
}
