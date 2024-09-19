import { Constructor } from "@/system";
import { Scope } from "./Scope";
import { ServiceFactory } from "./ServiceFactory";
import { ConstructorToken, ServiceFactoryToken, Token, ValueToken } from "./Token";

/**
 * Describes how a service should be resolved by a service provider.
 *
 * A {@link ServiceDescriptor} defines the token used to identify the service,
 * the scope of the service, and how the service is resolved.
 *
 * @template TToken The type of the token that identifies the service.
 * @template TService The type of the service being described.
 */
export interface ServiceDescriptor<TToken extends Token<any>, TService> {
  /**
   * The type of the service descriptor, which can be "constructor", "factory", or "value".
   */
  type: ServiceDescriptorType;

  /**
   * The lifecycle scope of the service.
   */
  scope: Scope;

  /**
   * The token used to identify the service.
   */
  token: TToken;

  /**
   * The service or factory function responsible for providing the service.
   */
  service: TService;
}

/**
 * Represents the possible types of service descriptors.
 *
 * - `constructor`: The service is instantiated from a class constructor.
 * - `factory`: The service is created by a factory function.
 * - `value`: The service is a static value.
 */
export type ServiceDescriptorType = "constructor" | "factory" | "value";

/**
 * A service descriptor for services instantiated via a class constructor.
 *
 * @template T The type of the service being constructed.
 */
export class ConstructorServiceDescriptor<T>
  implements ServiceDescriptor<ConstructorToken<T> | ValueToken, Constructor<T>>
{
  /**
   * The type of this service descriptor is always "constructor".
   */
  readonly type: ServiceDescriptorType = "constructor";

  /**
   * @param scope - The lifecycle scope of the service.
   * @param token - The token used to identify the service.
   * @param service - The class constructor used to create the service.
   */
  constructor(
    readonly scope: Scope,
    readonly token: ConstructorToken<T> | ValueToken,
    readonly service: Constructor<T>
  ) {}
}

/**
 * A service descriptor for services created by a factory function.
 *
 * @template T The type of the service being created by the factory.
 */
export class FactoryServiceDescriptor<T>
  implements ServiceDescriptor<ServiceFactoryToken<T> | ValueToken, ServiceFactory<T>>
{
  /**
   * The type of this service descriptor is always "factory".
   */
  readonly type: ServiceDescriptorType = "factory";

  /**
   * @param scope - The lifecycle scope of the service.
   * @param token - The token used to identify the service.
   * @param service - The factory function used to create the service.
   */
  constructor(
    readonly scope: Scope,
    readonly token: ServiceFactoryToken<T> | ValueToken,
    readonly service: ServiceFactory<T>
  ) {}
}

/**
 * A service descriptor for services represented by a static value.
 *
 * @template T The type of the value.
 */
export class ValueServiceDescriptor<T> implements ServiceDescriptor<ValueToken, T> {
  /**
   * The type of this service descriptor is always "value".
   */
  readonly type: ServiceDescriptorType = "value";

  /**
   * @param scope - The lifecycle scope of the service.
   * @param token - The token used to identify the service.
   * @param service - The static value representing the service.
   */
  constructor(readonly scope: Scope, readonly token: ValueToken, readonly service: T) {}
}
