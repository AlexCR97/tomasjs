import { isConstructor } from "./Constructor";
import { Scope, isScope } from "./Scope";
import {
  ConstructorServiceDescriptor,
  FactoryServiceDescriptor,
  ValueServiceDescriptor,
} from "./ServiceDescriptor";
import { ServiceFactory, isServiceFactory } from "./ServiceFactory";
import { ServiceProvider, TomasServiceProvider } from "./ServiceProvider";
import {
  ConstructorToken,
  ServiceFactoryToken,
  Token,
  ValueToken,
  isConstructorToken,
  isServiceFactoryToken,
  isValueToken,
} from "./Token";
import { NotImplementedError } from "./NotImplementedError";
import {
  ContainerSetup,
  ContainerSetupFunction,
  ContainerSetupFunctionAsync,
} from "./ContainerSetup";

export type Container = ContainerAdd & {
  get count(): number;
  clear(): void;
  contains<T>(token: Token<T>): boolean;
  dispose(): void;
  remove<T>(token: Token<T>): boolean;
  build(): ServiceProvider;
};

type ContainerAdd = {
  add<T>(scope: Scope, constructor: ConstructorToken<T>): ContainerAdd;
  add<T>(scope: Scope, factory: ServiceFactory<T>): ContainerAdd;
  add<T>(scope: Scope, token: ValueToken, factory: ServiceFactory<T>): ContainerAdd;
  add<T>(scope: Scope, token: ValueToken, value: T): ContainerAdd;
  add(...args: any[]): ContainerAdd;
};

export class TomasContainer implements Container {
  private readonly constructorRegistry = new Map<
    ConstructorToken<any>,
    ConstructorServiceDescriptor<any>
  >();

  private readonly factoryRegistry = new Map<
    ServiceFactoryToken<any>,
    FactoryServiceDescriptor<any>
  >();

  private readonly valueRegistry = new Map<ValueToken, ValueServiceDescriptor<any>>();

  get count(): number {
    return this.constructorRegistry.size + this.factoryRegistry.size + this.valueRegistry.size;
  }

  add<T>(scope: Scope, constructor: ConstructorToken<T>): TomasContainer;
  add<T>(scope: Scope, factory: ServiceFactory<T>): TomasContainer;
  add<T>(scope: Scope, token: ValueToken, factory: ServiceFactory<T>): TomasContainer;
  add<T>(scope: Scope, token: ValueToken, value: T): TomasContainer;
  add(...args: any[]): TomasContainer {
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

  private addConstructor<T>(scope: Scope, constructor: ConstructorToken<T>): TomasContainer {
    this.constructorRegistry.set(
      constructor,
      new ConstructorServiceDescriptor(scope, constructor, constructor)
    );
    return this;
  }

  private addFactory<T>(scope: Scope, factory: ServiceFactory<T>): TomasContainer;
  private addFactory<T>(
    scope: Scope,
    token: ValueToken,
    factory: ServiceFactory<T>
  ): TomasContainer;
  private addFactory(...args: any[]): TomasContainer {
    if (isScope(args[0]) && isServiceFactory(args[1])) {
      const [scope, factory] = args;
      this.factoryRegistry.set(factory, new FactoryServiceDescriptor(scope, factory, factory));
      return this;
    }

    if (isScope(args[0]) && isValueToken(args[1]) && isServiceFactory(args[2])) {
      const [scope, token, factory] = args;
      this.factoryRegistry.set(token, new FactoryServiceDescriptor(scope, token, factory));
      return this;
    }

    throw new NotImplementedError();
  }

  private addValue<T>(scope: Scope, token: ValueToken, value: T): TomasContainer {
    this.valueRegistry.set(token, new ValueServiceDescriptor(scope, token, value));
    return this;
  }

  clear(): void {
    this.constructorRegistry.clear();
    this.factoryRegistry.clear();
    this.valueRegistry.clear();
  }

  contains<T>(token: Token<T>): boolean {
    return (
      this.constructorRegistry.has(token as ConstructorToken<T>) ||
      this.factoryRegistry.has(token as ServiceFactoryToken<T>) ||
      this.valueRegistry.has(token as ValueToken)
    );
  }

  dispose(): void {
    throw new NotImplementedError();
  }

  remove<T>(token: Token<T>): boolean {
    if (!this.contains(token)) {
      return false;
    }

    if (isConstructorToken(token) && this.constructorRegistry.delete(token)) {
      return true;
    }

    if (isServiceFactoryToken(token) && this.factoryRegistry.delete(token)) {
      return true;
    }

    if (isValueToken(token) && this.valueRegistry.delete(token)) {
      return true;
    }

    throw new NotImplementedError();
  }

  build(): ServiceProvider {
    return new TomasServiceProvider([
      ...this.constructorRegistry.values(),
      ...this.factoryRegistry.values(),
      ...this.valueRegistry.values(),
    ]);
  }
}

export class ContainerBuilder implements ContainerAdd {
  private readonly setups: ContainerSetup[] = [];

  add<T>(scope: Scope, constructor: ConstructorToken<T>): ContainerBuilder;
  add<T>(scope: Scope, factory: ServiceFactory<T>): ContainerBuilder;
  add<T>(scope: Scope, token: ValueToken, factory: ServiceFactory<T>): ContainerBuilder;
  add<T>(scope: Scope, token: ValueToken, value: T): ContainerBuilder;
  add(...args: any[]): ContainerBuilder {
    return this.use((container) => container.add(...args));
  }

  use(setup: ContainerSetupFunction): ContainerBuilder;
  use(setup: ContainerSetupFunctionAsync): ContainerBuilder;
  use(...args: any[]): ContainerBuilder {
    this.setups.push(...args);
    return this;
  }

  async buildContainer(): Promise<Container> {
    const container = new TomasContainer();

    for (let index = 0; index < this.setups.length; index++) {
      const setup = this.setups[index];
      await setup(container);
    }

    return container;
  }

  async buildServiceProvider(): Promise<ServiceProvider> {
    const container = await this.buildContainer();
    return container.build();
  }
}
