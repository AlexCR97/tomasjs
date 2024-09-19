import {
  ConstructorServiceDescriptor,
  FactoryServiceDescriptor,
  ServiceDescriptor,
  ValueServiceDescriptor,
} from "./ServiceDescriptor";
import { Token } from "./Token";
import { Scope } from "./Scope";
import { InjectDecoratorMetadata } from "./@inject";
import { InvalidOperationError, TomasError } from "@/errors";

/**
 * An {@link IServiceProvider} tracks the services registered in a DI container and
 * exposes an API to manage service resolution and retrieval based on service descriptors.
 */
export interface IServiceProvider {
  /**
   * Gets the number of registered services.
   */
  get count(): number;

  /**
   * Finds all instances of a service identified by the given token.
   *
   * @template T The type of the service.
   * @param token - The token identifying the service.
   * @returns An array of service instances.
   */
  find<T>(token: Token<T>): readonly T[];

  /**
   * Retrieves a single instance of a service identified by the given token.
   *
   * @template T The type of the service.
   * @param token - The token identifying the service.
   * @returns The service instance or `undefined` if not found.
   */
  get<T>(token: Token<T>): T | undefined;

  /**
   * Retrieves a single instance of a service, throwing an error if not found.
   *
   * @template T The type of the service.
   * @param token - The token identifying the service.
   * @returns The service instance.
   * @throws {ServiceNotFoundError} If no service is found with the token.
   */
  getOrThrow<T>(token: Token<T>): T;

  /**
   * Retrieves the last registered instance of a service identified by the given token.
   *
   * @template T The type of the service.
   * @param token - The token identifying the service.
   * @returns The last service instance or `undefined` if not found.
   */
  last<T>(token: Token<T>): T | undefined;

  /**
   * Retrieves the last registered instance of a service, throwing an error if not found.
   *
   * @template T The type of the service.
   * @param token - The token identifying the service.
   * @returns The last service instance.
   * @throws {ServiceNotFoundError} If no service is found with the token.
   */
  lastOrThrow<T>(token: Token<T>): T;
}

/**
 * A {@link ServiceProvider} tracks the services registered in a DI container and
 * exposes an API to manage service resolution and retrieval based on service descriptors.
 */
export class ServiceProvider implements IServiceProvider {
  private readonly resolvedServices = new Map<Token<any>, any>();

  /**
   * @param serviceDescriptors - The list of service descriptors tracked by the provider.
   */
  constructor(private readonly serviceDescriptors: readonly ServiceDescriptor<any, any>[]) {}

  get count(): number {
    return this.serviceDescriptors.length;
  }

  find<T>(token: Token<T>): readonly T[] {
    return this.serviceDescriptors
      .filter((sd) => sd.token === token)
      .map((sd) => this.resolve<T>(sd));
  }

  get<T>(token: Token<T>): T | undefined {
    const serviceDescriptor = this.serviceDescriptors.find((sd) => sd.token === token);

    if (serviceDescriptor === undefined) {
      return undefined;
    }

    return this.resolve(serviceDescriptor);
  }

  getOrThrow<T>(token: Token<T>): T {
    const service = this.get(token);

    if (service === undefined) {
      throw new ServiceNotFoundError(token);
    }

    return service;
  }

  last<T>(token: Token<T>): T | undefined {
    const serviceDescriptor = this.serviceDescriptors.findLast((sd) => sd.token === token);

    if (serviceDescriptor === undefined) {
      return undefined;
    }

    return this.resolve(serviceDescriptor);
  }

  lastOrThrow<T>(token: Token<T>): T {
    const service = this.last(token);

    if (service === undefined) {
      throw new ServiceNotFoundError(token);
    }

    return service;
  }

  private resolve<T>(serviceDescriptor: ConstructorServiceDescriptor<T>): T;
  private resolve<T>(serviceDescriptor: FactoryServiceDescriptor<T>): T;
  private resolve<T>(serviceDescriptor: ValueServiceDescriptor<T>): T;
  private resolve<T>(arg: any): T {
    if (arg instanceof ConstructorServiceDescriptor) {
      return this.resolveConstructorService(arg);
    }

    if (arg instanceof FactoryServiceDescriptor) {
      return this.resolveFactoryService(arg);
    }

    if (arg instanceof ValueServiceDescriptor) {
      return this.resolveValueService(arg);
    }

    throw new InvalidOperationError();
  }

  private resolveConstructorService<T>(serviceDescriptor: ConstructorServiceDescriptor<T>): T {
    return this.resolveService(serviceDescriptor.scope, serviceDescriptor.token, () => {
      const constructorParameters: any[] | undefined = Reflect.getOwnMetadata(
        "design:paramtypes",
        serviceDescriptor.service
      );

      const dependencies = (constructorParameters ?? []).map((_, paramIndex) => {
        const metadata = new InjectDecoratorMetadata<T>(serviceDescriptor.service, paramIndex);

        if (metadata.value.multiple === true) {
          return this.find(metadata.value.token);
        } else {
          return this.getOrThrow(metadata.value.token);
        }
      });

      return new serviceDescriptor.service(...dependencies);
    });
  }

  private resolveFactoryService<T>(serviceDescriptor: FactoryServiceDescriptor<T>): T {
    return this.resolveService(serviceDescriptor.scope, serviceDescriptor.token, () => {
      return serviceDescriptor.service(this);
    });
  }

  private resolveValueService<T>(serviceDescriptor: ValueServiceDescriptor<T>): T {
    return this.resolveService(serviceDescriptor.scope, serviceDescriptor.token, () => {
      return serviceDescriptor.service;
    });
  }

  private resolveService<TToken extends Token<any>, TService>(
    scope: Scope,
    token: TToken,
    resolver: () => TService
  ): TService {
    if (scope === "scoped") {
      return resolver();
    }

    if (scope === "singleton") {
      let resolvedService = this.resolvedServices.get(token);

      if (resolvedService === undefined || resolvedService === null) {
        resolvedService = resolver();
        this.resolvedServices.set(token, resolvedService);
      }

      return resolvedService;
    }

    throw new InvalidOperationError();
  }
}

/**
 * Thrown when a requested service is not found in the service provider.
 *
 * @template T The type of the service.
 */
export class ServiceNotFoundError<T> extends TomasError {
  /**
   * @param token - The token identifying the missing service.
   */
  constructor(token: Token<T>) {
    super("core/di/ServiceNotFound", `No such service found with token ${token}`, {
      data: { token },
    });
  }
}
