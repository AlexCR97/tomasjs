import {
  ConstructorServiceDescriptor,
  FactoryServiceDescriptor,
  ServiceDescriptor,
  ValueServiceDescriptor,
} from "./ServiceDescriptor";
import { Token } from "./Token";
import { NotImplementedError } from "./NotImplementedError";
import { ServiceNotFoundError } from "./ServiceNotFoundError";
import { Scope } from "./Scope";

export interface IServiceProvider {
  get count(): number;
  find<T>(token: Token<T>): readonly T[];
  get<T>(token: Token<T>): T | undefined;
  getOrThrow<T>(token: Token<T>): T;
}

export class ServiceProvider implements IServiceProvider {
  private readonly resolvedServices = new Map<Token<any>, any>();

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

    throw new NotImplementedError();
  }

  private resolveConstructorService<T>(serviceDescriptor: ConstructorServiceDescriptor<T>): T {
    return this.resolveService(serviceDescriptor.scope, serviceDescriptor.token, () => {
      // TODO Inject dependencies
      return new serviceDescriptor.service();
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

    throw new NotImplementedError();
  }
}
