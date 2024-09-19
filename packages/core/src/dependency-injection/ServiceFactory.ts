import { IServiceProvider } from "./ServiceProvider";

/**
 * A factory function that creates an instance of a service.
 *
 * The {@link ServiceFactory} receives an {@link IServiceProvider} to resolve dependencies and returns a service of type {@link T}.
 *
 * @template T The type of the service being created.
 * @param provider - The service provider used to resolve dependencies.
 * @returns The service instance of type {@link T}.
 *
 * @example
 * const myFactory: ServiceFactory<MyService> = (provider) => new MyService(provider.getOrThrow(DEPENDENCY_TOKEN));
 */
export type ServiceFactory<T> = (provider: IServiceProvider) => T;

/**
 * Determines if the provided object is a {@link ServiceFactory}.
 *
 * A service factory is a function that takes an {@link IServiceProvider} and returns a service of type {@link T}.
 *
 * @template T The type of the service being created.
 * @param obj - The object to check.
 * @returns `true` if the object is a service factory; otherwise, `false`.
 *
 * @example
 * const factory = (provider: IServiceProvider) => new MyService();
 * const isFactory = isServiceFactory(factory); // true
 *
 * @example
 * const notFactory = "not a function";
 * const isFactory = isServiceFactory(notFactory); // false
 */
export function isServiceFactory<T>(obj: any): obj is ServiceFactory<T> {
  return typeof obj === "function";
}
