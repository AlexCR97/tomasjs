import { Token } from "./Token";

/**
 * A decorator factory used to inject dependencies into class constructors.
 *
 * This decorator allows you to inject a service identified by a token and
 * specify options for the service resolution.
 *
 * @template T The type of the service to be injected.
 * @param token - The token that identifies the service.
 * @param options - Optional settings for service resolution.
 * @param options.multiple - Whether multiple instances of the service should be injected. Defaults to `false`. If `false`, the first occurrence of the service is used. If `true`, all known instances of the service are injected as an array.
 *
 * @example
 * // Example with single instance
 *
 * class MyService {}
 *
 * class MyController {
 *   constructor(@inject(MyService) private myService: MyService) {}
 * }
 *
 * @example
 * // Example with multiple instances
 *
 * class AnotherService {}
 *
 * class MyControllerWithMultiple {
 *   constructor(@inject(AnotherService, { multiple: true }) private otherServices: AnotherService[]) {}
 * }
 */
export function inject<T>(token: Token<T>, options?: { multiple?: boolean }) {
  return function (target: Object, paramKey: undefined, paramIndex: number) {
    new InjectDecoratorMetadata(target, paramIndex).value = {
      token,
      paramIndex,
      multiple: options?.multiple ?? false,
    };
  };
}

/**
 * Manages metadata associated with the `@inject` decorator.
 *
 * This class handles storing and retrieving metadata for dependency injection
 * into class constructors.
 *
 * @template T The type of the dependency associated with the metadata.
 */
export class InjectDecoratorMetadata<T> {
  private readonly symbol = Symbol.for("@inject");

  constructor(private readonly target: Object, private readonly paramIndex: number) {}

  /**
   * Gets or sets the metadata value for the parameter at the specified index.
   */
  get value(): InjectDecoratorMetadataValue<T> {
    return Reflect.getOwnMetadata(this.symbol, this.target, this.paramIndex.toString());
  }
  set value(value: InjectDecoratorMetadataValue<T>) {
    Reflect.defineMetadata(this.symbol, value, this.target, this.paramIndex.toString());
  }
}

/**
 * The metadata value type for the `@inject` decorator.
 *
 * @template T The type of the dependency.
 */
export type InjectDecoratorMetadataValue<T> = {
  token: Token<T>;
  paramIndex: number;
  multiple: boolean;
};
