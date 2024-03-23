import { Constructor } from "./Constructor";
import { Scope } from "./Scope";
import { ServiceFactory } from "./ServiceFactory";

export interface ServiceDescriptor<TToken, TService> {
  type: ServiceDescriptorType;
  scope: Scope;
  token: TToken;
  service: TService;
}

export type ServiceDescriptorType = "constructor" | "factory" | "value";

export class ConstructorServiceDescriptor<T>
  implements ServiceDescriptor<Constructor<T>, Constructor<T>>
{
  readonly type: ServiceDescriptorType = "constructor";

  constructor(
    readonly scope: Scope,
    readonly token: Constructor<T>,
    readonly service: Constructor<T>
  ) {}
}

export class FactoryServiceDescriptor<T>
  implements ServiceDescriptor<ServiceFactory<T> | string, ServiceFactory<T>>
{
  readonly type: ServiceDescriptorType = "factory";

  constructor(
    readonly scope: Scope,
    readonly token: ServiceFactory<T> | string,
    readonly service: ServiceFactory<T>
  ) {}
}

export class ValueServiceDescriptor<T> implements ServiceDescriptor<string, T> {
  readonly type: ServiceDescriptorType = "value";

  constructor(readonly scope: Scope, readonly token: string, readonly service: T) {}
}
