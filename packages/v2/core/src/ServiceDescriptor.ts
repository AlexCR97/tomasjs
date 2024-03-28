import { Constructor } from "./Constructor";
import { Scope } from "./Scope";
import { ServiceFactory } from "./ServiceFactory";
import { ConstructorToken, ServiceFactoryToken, ValueToken } from "./Token";

export interface ServiceDescriptor<TToken, TService> {
  type: ServiceDescriptorType;
  scope: Scope;
  token: TToken;
  service: TService;
}

export type ServiceDescriptorType = "constructor" | "factory" | "value";

export class ConstructorServiceDescriptor<T>
  implements ServiceDescriptor<ConstructorToken<T> | ValueToken, Constructor<T>>
{
  readonly type: ServiceDescriptorType = "constructor";

  constructor(
    readonly scope: Scope,
    readonly token: ConstructorToken<T> | ValueToken,
    readonly service: Constructor<T>
  ) {}
}

export class FactoryServiceDescriptor<T>
  implements ServiceDescriptor<ServiceFactoryToken<T> | ValueToken, ServiceFactory<T>>
{
  readonly type: ServiceDescriptorType = "factory";

  constructor(
    readonly scope: Scope,
    readonly token: ServiceFactoryToken<T> | ValueToken,
    readonly service: ServiceFactory<T>
  ) {}
}

export class ValueServiceDescriptor<T> implements ServiceDescriptor<ValueToken, T> {
  readonly type: ServiceDescriptorType = "value";

  constructor(readonly scope: Scope, readonly token: ValueToken, readonly service: T) {}
}
