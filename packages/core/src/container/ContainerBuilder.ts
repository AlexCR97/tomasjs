import { ClassConstructor } from "@/reflection";
import { Container } from "./Container";
import { ContainerServiceProvider } from "./ContainerServiceProvider";
import { ContainerSetupFactory } from "./ContainerSetupFactory";
import { ContainerSetupType } from "./ContainerSetupType";
import { ServiceProvider } from "./ServiceProvider";
import { globalContainer } from "./globalContainerInstance";
import { Token } from "./Token";
import { Scope } from "./Scope";

export class ContainerBuilder {
  private readonly setups: ContainerSetupType[] = [];

  addClass<T>(
    constructor: ClassConstructor<T>,
    options?: { token?: Token<T>; scope?: Scope }
  ): ContainerBuilder {
    globalContainer.addClass<T>(constructor, options);
    return this;
  }

  addInstance<T>(instance: T, token: Token<T>): ContainerBuilder {
    globalContainer.addInstance(instance, token);
    return this;
  }

  setup(setup: ContainerSetupType): ContainerBuilder {
    this.setups.push(setup);
    return this;
  }

  async buildAsync(): Promise<void> {
    await this.setupServicesAsync();
  }

  async buildContainerAsync(): Promise<Container> {
    await this.setupServicesAsync();
    return globalContainer;
  }

  async buildServiceProviderAsync(): Promise<ServiceProvider> {
    await this.setupServicesAsync();
    return new ContainerServiceProvider(globalContainer);
  }

  private async setupServicesAsync() {
    for (const setup of this.setups) {
      const setupCallback = setup instanceof ContainerSetupFactory ? setup.create() : setup;
      await setupCallback(globalContainer);
    }
  }
}
