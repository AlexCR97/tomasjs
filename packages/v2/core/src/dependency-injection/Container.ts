import { isConstructor } from "./Constructor";
import { Scope, isScope } from "./Scope";
import {
  ConstructorServiceDescriptor,
  FactoryServiceDescriptor,
  ServiceDescriptor,
  ValueServiceDescriptor,
} from "./ServiceDescriptor";
import { ServiceFactory, isServiceFactory } from "./ServiceFactory";
import { IServiceProvider, ServiceProvider } from "./ServiceProvider";
import { ConstructorToken, Token, ValueToken, isConstructorToken, isValueToken } from "./Token";
import { NotImplementedError } from "./NotImplementedError";
import {
  ContainerSetup,
  ContainerSetupFunction,
  ContainerSetupFunctionAsync,
} from "./ContainerSetup";
import { ConfigurationSetup } from "@/configuration/ConfigurationSetup";
import { loggerSetup } from "@/logging/loggerSetup";

export interface IContainer {
  get count(): number;
  add<T>(scope: Scope, constructor: ConstructorToken<T>): IContainer;
  add<T>(scope: Scope, factory: ServiceFactory<T>): IContainer;
  add<T>(scope: Scope, token: ValueToken, constructor: ConstructorToken<T>): IContainer;
  add<T>(scope: Scope, token: ValueToken, factory: ServiceFactory<T>): IContainer;
  add<T>(scope: Scope, token: ValueToken, value: T): IContainer;
  clear(): void;
  contains<T>(token: Token<T>): boolean;
  remove<T>(token: Token<T>): boolean;
  build(): IServiceProvider;
}

export class Container implements IContainer {
  private readonly serviceDescriptors: ServiceDescriptor<any, any>[] = [];

  get count(): number {
    return this.serviceDescriptors.length;
  }

  add<T>(scope: Scope, constructor: ConstructorToken<T>): Container;
  add<T>(scope: Scope, factory: ServiceFactory<T>): Container;
  add<T>(scope: Scope, token: ValueToken, constructor: ConstructorToken<T>): Container;
  add<T>(scope: Scope, token: ValueToken, factory: ServiceFactory<T>): Container;
  add<T>(scope: Scope, token: ValueToken, value: T): Container;
  add(...args: any[]): Container {
    if (args.length === 2) {
      if (isScope(args[0]) && isConstructor(args[1])) {
        const [scope, constructor] = args;
        return this.addConstructor(scope, constructor);
      }

      if (isScope(args[0]) && isServiceFactory(args[1])) {
        const [scope, factory] = args;
        return this.addFactory(scope, factory);
      }
    }

    if (args.length === 3) {
      if (isScope(args[0]) && isValueToken(args[1]) && isConstructorToken(args[2])) {
        const [scope, token, constructor] = args;
        return this.addConstructor(scope, token, constructor);
      }

      if (isScope(args[0]) && isValueToken(args[1]) && isServiceFactory(args[2])) {
        const [scope, token, factory] = args;
        return this.addFactory(scope, token, factory);
      }

      if (isScope(args[0]) && isValueToken(args[1]) && args[2] !== undefined && args[2] !== null) {
        const [scope, token, value] = args;
        return this.addValue(scope, token, value);
      }
    }

    throw new NotImplementedError();
  }

  private addConstructor<T>(scope: Scope, constructor: ConstructorToken<T>): Container;
  private addConstructor<T>(
    scope: Scope,
    token: ValueToken,
    constructor: ConstructorToken<T>
  ): Container;
  private addConstructor(...args: any[]): Container {
    if (isScope(args[0]) && isConstructorToken(args[1])) {
      const [scope, constructor] = args;
      this.serviceDescriptors.push(
        new ConstructorServiceDescriptor(scope, constructor, constructor)
      );
      return this;
    }

    if (isScope(args[0]) && isValueToken(args[1]) && isConstructorToken(args[2])) {
      const [scope, token, constructor] = args;
      this.serviceDescriptors.push(new ConstructorServiceDescriptor(scope, token, constructor));
      return this;
    }

    throw new NotImplementedError();
  }

  private addFactory<T>(scope: Scope, factory: ServiceFactory<T>): Container;
  private addFactory<T>(scope: Scope, token: ValueToken, factory: ServiceFactory<T>): Container;
  private addFactory(...args: any[]): Container {
    if (isScope(args[0]) && isServiceFactory(args[1])) {
      const [scope, factory] = args;
      this.serviceDescriptors.push(new FactoryServiceDescriptor(scope, factory, factory));
      return this;
    }

    if (isScope(args[0]) && isValueToken(args[1]) && isServiceFactory(args[2])) {
      const [scope, token, factory] = args;
      this.serviceDescriptors.push(new FactoryServiceDescriptor(scope, token, factory));
      return this;
    }

    throw new NotImplementedError();
  }

  private addValue<T>(scope: Scope, token: ValueToken, value: T): Container {
    this.serviceDescriptors.push(new ValueServiceDescriptor(scope, token, value));
    return this;
  }

  clear(): void {
    this.serviceDescriptors.splice(0, this.serviceDescriptors.length);
  }

  contains<T>(token: Token<T>): boolean {
    return this.serviceDescriptors.some((x) => x.token === token);
  }

  remove<T>(token: Token<T>): boolean {
    if (!this.contains(token)) {
      return false;
    }

    const index = this.serviceDescriptors.findIndex((x) => x.token === token);

    if (index === -1) {
      return false;
    }

    this.serviceDescriptors.splice(index, 1);
    return true;
  }

  build(): IServiceProvider {
    return new ServiceProvider(this.serviceDescriptors);
  }
}

export interface IContainerBuilder {
  add<T>(scope: Scope, constructor: ConstructorToken<T>): IContainerBuilder;
  add<T>(scope: Scope, factory: ServiceFactory<T>): IContainerBuilder;
  add<T>(scope: Scope, token: ValueToken, constructor: ConstructorToken<T>): IContainerBuilder;
  add<T>(scope: Scope, token: ValueToken, factory: ServiceFactory<T>): IContainerBuilder;
  add<T>(scope: Scope, token: ValueToken, value: T): IContainerBuilder;
  addConfiguration(setup: (builder: ConfigurationSetup) => void): ContainerBuilder;
  addLogging(): ContainerBuilder;
  use(setup: ContainerSetupFunction): ContainerBuilder;
  use(setup: ContainerSetupFunctionAsync): ContainerBuilder;
  buildContainer(): Promise<IContainer>;
  buildServiceProvider(): Promise<IServiceProvider>;
}

export class ContainerBuilder implements IContainerBuilder {
  private readonly setups: ContainerSetup[] = [];

  add<T>(scope: Scope, constructor: ConstructorToken<T>): ContainerBuilder;
  add<T>(scope: Scope, factory: ServiceFactory<T>): ContainerBuilder;
  add<T>(scope: Scope, token: ValueToken, constructor: ConstructorToken<T>): ContainerBuilder;
  add<T>(scope: Scope, token: ValueToken, factory: ServiceFactory<T>): ContainerBuilder;
  add<T>(scope: Scope, token: ValueToken, value: T): ContainerBuilder;
  add(...args: any[]): ContainerBuilder {
    if (args.length === 2) {
      if (isScope(args[0]) && isConstructor(args[1])) {
        const [scope, constructor] = args;
        return this.use((container) => container.add(scope, constructor));
      }

      if (isScope(args[0]) && isServiceFactory(args[1])) {
        const [scope, factory] = args;
        return this.use((container) => container.add(scope, factory));
      }
    }

    if (args.length === 3) {
      if (isScope(args[0]) && isValueToken(args[1]) && isConstructorToken(args[2])) {
        const [scope, token, constructor] = args;
        return this.use((container) => container.add(scope, token, constructor));
      }

      if (isScope(args[0]) && isValueToken(args[1]) && isServiceFactory(args[2])) {
        const [scope, token, factory] = args;
        return this.use((container) => container.add(scope, token, factory));
      }

      if (isScope(args[0]) && isValueToken(args[1]) && args[2] !== undefined && args[2] !== null) {
        const [scope, token, value] = args;
        return this.use((container) => container.add(scope, token, value));
      }
    }

    throw new NotImplementedError();
  }

  addConfiguration(setup?: (builder: ConfigurationSetup) => void): ContainerBuilder {
    const configurationSetup = new ConfigurationSetup();

    if (setup !== null && setup !== undefined) {
      setup(configurationSetup);
    }

    this.setups.push(configurationSetup.build());

    return this;
  }

  addLogging(): ContainerBuilder {
    this.setups.push(loggerSetup);
    return this;
  }

  use(setup: ContainerSetupFunction): ContainerBuilder;
  use(setup: ContainerSetupFunctionAsync): ContainerBuilder;
  use(...args: any[]): ContainerBuilder {
    this.setups.push(...args);
    return this;
  }

  async buildContainer(): Promise<IContainer> {
    const container = new Container();

    for (let index = 0; index < this.setups.length; index++) {
      const setup = this.setups[index];
      await setup(container);
    }

    return container;
  }

  async buildServiceProvider(): Promise<IServiceProvider> {
    const container = await this.buildContainer();
    return container.build();
  }
}
