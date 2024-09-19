import { Constructor, isConstructor } from "@/system";
import { Scope, isScope } from "./Scope";
import {
  ConstructorServiceDescriptor,
  FactoryServiceDescriptor,
  ServiceDescriptor,
  ValueServiceDescriptor,
} from "./ServiceDescriptor";
import { ServiceFactory, isServiceFactory } from "./ServiceFactory";
import { IServiceProvider, ServiceProvider } from "./ServiceProvider";
import {
  ConstructorToken,
  ServiceFactoryToken,
  Token,
  ValueToken,
  isConstructorToken,
  isValueToken,
} from "./Token";
import {
  ContainerSetup,
  ContainerSetupFunction,
  ContainerSetupFunctionAsync,
} from "./ContainerSetup";
import { InvalidOperationError } from "@/errors";
import { ContainerBuilderDelegate } from "./ContainerBuilderDelegate";

/**
 * A dependency injection container that manages service registration.
 */
export interface IContainer {
  /** Gets the number of registered services. */
  get count(): number;

  /**
   * Registers a service identified by a {@link ConstructorToken}.
   * The provided {@link constructor} is then used to resolve the service.
   *
   * @template T The type of the service.
   * @param scope - The lifetime {@link Scope} of the service.
   * @param constructor - The {@link Constructor} that identifies the service and that is then used to resolve the service.
   * @returns The current container instance for chaining.
   */
  add<T>(scope: Scope, constructor: ConstructorToken<T>): IContainer;

  /**
   * Registers a service identified by a {@link ServiceFactoryToken}.
   * The provided {@link factory} is then used to resolve the service.
   *
   * @template T The type of the service.
   * @param scope - The lifetime {@link Scope} of the service.
   * @param factory - The {@link ServiceFactory} that identifies the service and that is then used to resolve the service.
   * @returns The current container instance for chaining.
   */
  add<T>(scope: Scope, factory: ServiceFactory<T>): IContainer;

  /**
   * Registers a service identified by a {@link ValueToken}.
   * The provided {@link constructor} is then used to resolve the service.
   *
   * @template T The type of the service.
   * @param scope - The lifetime {@link Scope} of the service.
   * @param token - The {@link ValueToken} that identifies the service.
   * @param constructor - The {@link Constructor} used to resolve the service.
   * @returns The current container instance for chaining.
   */
  add<T>(scope: Scope, token: ValueToken, constructor: ConstructorToken<T>): IContainer;

  /**
   * Registers a service identified by a {@link ValueToken}.
   * The provided {@link factory} is then used to resolve the service.
   *
   * @template T The type of the service.
   * @param scope - The lifetime {@link Scope} of the service.
   * @param token - The {@link ValueToken} that identifies the service.
   * @param factory - The {@link ServiceFactory} used to resolve the service.
   * @returns The current container instance for chaining.
   */
  add<T>(scope: Scope, token: ValueToken, factory: ServiceFactory<T>): IContainer;

  /**
   * Registers a service identified by a {@link ValueToken}.
   * The provided {@link value} is then used to resolve the service. Since it's a static value,
   * the service resolution consists of simply returning the registered value without
   * any extra computations.
   *
   * @template T The type of the service.
   * @param scope - The lifetime {@link Scope} of the service.
   * @param token - The {@link ValueToken} that identifies the service.
   * @param value - The static value to register as the service.
   * @returns The current container instance for chaining.
   */
  add<T>(scope: Scope, token: ValueToken, value: T): IContainer;

  /**
   * This method is an alias to the {@link add} method with the {@link Scope}, {@link ValueToken} and {@link T} overload.
   *
   * Registers a service identified by a {@link ValueToken}.
   * The provided {@link value} is then used to resolve the service. Since it's a static value,
   * the service resolution consists of simply returning the registered value without
   * any extra computations.
   *
   * @template T The type of the service.
   * @param scope - The lifetime {@link Scope} of the service.
   * @param token - The {@link ValueToken} that identifies the service.
   * @param value - The static value to register as the service.
   * @returns The current container instance for chaining.
   */
  addValue<T>(scope: Scope, token: ValueToken, value: T): IContainer;

  /** Removes all registered services from the container. */
  clear(): void;

  /**
   * Checks if a service with the given token is registered in the container.
   *
   * @template T The type of the service.
   * @param token - The token identifying the service.
   * @returns `true` if the service is registered, otherwise `false`.
   */
  contains<T>(token: Token<T>): boolean;

  /**
   * Removes a service with the given token from the container.
   *
   * @template T The type of the service.
   * @param token - The token identifying the service.
   * @returns `true` if the service was successfully removed, otherwise `false`.
   */
  remove<T>(token: Token<T>): boolean;

  /**
   * Takes the registered services and builds them into {@link ServiceDescriptor}s, which are
   * then passed to an {@link IServiceProvider} to manage service resolution and retrieval.
   *
   * @returns The service provider.
   */
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

    throw new InvalidOperationError();
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

    throw new InvalidOperationError();
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

    throw new InvalidOperationError();
  }

  addValue<T>(scope: Scope, token: ValueToken, value: T): Container {
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

/**
 * A builder for constructing an {@link IContainer}.
 *
 * It builds upon the {@link IContainer} interface and provides a fluent API
 * for chaining, with additional methods for custom setups and delegation.
 */
export interface IContainerBuilder {
  /**
   * Registers a service identified by a {@link ConstructorToken}.
   * The provided {@link constructor} is then used to resolve the service.
   *
   * @template T The type of the service.
   * @param scope - The lifetime {@link Scope} of the service.
   * @param constructor - The {@link Constructor} that identifies the service and that is then used to resolve the service.
   * @returns The current builder instance for chaining.
   */
  add<T>(scope: Scope, constructor: ConstructorToken<T>): IContainerBuilder;

  /**
   * Registers a service identified by a {@link ServiceFactoryToken}.
   * The provided {@link factory} is then used to resolve the service.
   *
   * @template T The type of the service.
   * @param scope - The lifetime {@link Scope} of the service.
   * @param factory - The {@link ServiceFactory} that identifies the service and that is then used to resolve the service.
   * @returns The current builder instance for chaining.
   */
  add<T>(scope: Scope, factory: ServiceFactory<T>): IContainerBuilder;

  /**
   * Registers a service identified by a {@link ValueToken}.
   * The provided {@link constructor} is then used to resolve the service.
   *
   * @template T The type of the service.
   * @param scope - The lifetime {@link Scope} of the service.
   * @param token - The {@link ValueToken} that identifies the service.
   * @param constructor - The {@link Constructor} used to resolve the service.
   * @returns The current builder instance for chaining.
   */
  add<T>(scope: Scope, token: ValueToken, constructor: ConstructorToken<T>): IContainerBuilder;

  /**
   * Registers a service identified by a {@link ValueToken}.
   * The provided {@link factory} is then used to resolve the service.
   *
   * @template T The type of the service.
   * @param scope - The lifetime {@link Scope} of the service.
   * @param token - The {@link ValueToken} that identifies the service.
   * @param factory - The {@link ServiceFactory} used to resolve the service.
   * @returns The current builder instance for chaining.
   */
  add<T>(scope: Scope, token: ValueToken, factory: ServiceFactory<T>): IContainerBuilder;

  /**
   * Registers a service identified by a {@link ValueToken}.
   * The provided {@link value} is then used to resolve the service. Since it's a static value,
   * the service resolution consists of simply returning the registered value without
   * any extra computations.
   *
   * @template T The type of the service.
   * @param scope - The lifetime {@link Scope} of the service.
   * @param token - The {@link ValueToken} that identifies the service.
   * @param value - The static value to register as the service.
   * @returns The current builder instance for chaining.
   */
  add<T>(scope: Scope, token: ValueToken, value: T): IContainerBuilder;

  /**
   * This method is an alias to the {@link add} method with the {@link Scope}, {@link ValueToken} and {@link T} overload.
   *
   * Registers a service identified by a {@link ValueToken}.
   * The provided {@link value} is then used to resolve the service. Since it's a static value,
   * the service resolution consists of simply returning the registered value without
   * any extra computations.
   *
   * @template T The type of the service.
   * @param scope - The lifetime {@link Scope} of the service.
   * @param token - The {@link ValueToken} that identifies the service.
   * @param value - The static value to register as the service.
   * @returns The current container instance for chaining.
   */
  addValue<T>(scope: Scope, token: ValueToken, value: T): IContainerBuilder;

  /**
   * Configures the container by using the provided setup function.
   *
   * @param setup - A function that performs setup operations on the container.
   * @returns The current builder instance for chaining.
   */
  setup(setup: ContainerSetupFunction): IContainerBuilder;

  /**
   * Configures the container by using the provided asynchronous setup function.
   *
   * @param setup - A function that performs asynchronous setup operations on the container.
   * @returns The current builder instance for chaining.
   */
  setup(setup: ContainerSetupFunctionAsync): IContainerBuilder;

  /**
   * Configures the builder by using the provided delegate function.
   *
   * @param delegate - A function used to configure the current builder.
   * @returns The current builder instance for chaining.
   */
  delegate(delegate: ContainerBuilderDelegate): IContainerBuilder;

  /**
   * Creates an {@link IContainer} by applying all the setups as specified by the builder.
   *
   * @returns A promise that resolves with the built container.
   */
  buildContainer(): Promise<IContainer>;

  /**
   * Creates an {@link IServiceProvider} by applying all the setups to an {@link IContainer} as specified by the builder.
   *
   * @returns A promise that resolves with the built service provider.
   */
  buildServiceProvider(): Promise<IServiceProvider>;
}

export class ContainerBuilder implements IContainerBuilder {
  private readonly setups: ContainerSetup[] = [];

  add<T>(scope: Scope, constructor: ConstructorToken<T>): this;
  add<T>(scope: Scope, factory: ServiceFactory<T>): this;
  add<T>(scope: Scope, token: ValueToken, constructor: ConstructorToken<T>): this;
  add<T>(scope: Scope, token: ValueToken, factory: ServiceFactory<T>): this;
  add<T>(scope: Scope, token: ValueToken, value: T): this;
  add(...args: any[]): this {
    if (args.length === 2) {
      if (isScope(args[0]) && isConstructor(args[1])) {
        const [scope, constructor] = args;
        return this.setup((container) => container.add(scope, constructor));
      }

      if (isScope(args[0]) && isServiceFactory(args[1])) {
        const [scope, factory] = args;
        return this.setup((container) => container.add(scope, factory));
      }
    }

    if (args.length === 3) {
      if (isScope(args[0]) && isValueToken(args[1]) && isConstructorToken(args[2])) {
        const [scope, token, constructor] = args;
        return this.setup((container) => container.add(scope, token, constructor));
      }

      if (isScope(args[0]) && isValueToken(args[1]) && isServiceFactory(args[2])) {
        const [scope, token, factory] = args;
        return this.setup((container) => container.add(scope, token, factory));
      }

      if (isScope(args[0]) && isValueToken(args[1]) && args[2] !== undefined && args[2] !== null) {
        const [scope, token, value] = args;
        return this.setup((container) => container.add(scope, token, value));
      }
    }

    throw new InvalidOperationError();
  }

  addValue<T>(scope: Scope, token: ValueToken, value: T): this {
    return this.setup((container) => container.addValue(scope, token, value));
  }

  setup(setup: ContainerSetupFunction): this;
  setup(setup: ContainerSetupFunctionAsync): this;
  setup(...args: any[]): this {
    this.setups.push(...args);
    return this;
  }

  delegate(delegate: ContainerBuilderDelegate): this {
    delegate(this);
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
