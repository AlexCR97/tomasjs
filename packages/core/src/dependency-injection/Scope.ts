const SCOPES = ["singleton", "scoped"] as const;

/**
 * A dependency injection scope.
 *
 * Services are always registered with a scope which dictates when a new instance
 * is created and how many times it is reused, or in other words, the lifetime of
 * the service.
 *
 * There are two valid scopes:
 * 1. `singleton`
 * 2. `scoped`
 *
 * ### Singleton scope
 *
 * When a service is registered with the `singleton` scope, the service lives as long as
 * the DI container. A single instance is created and reused whenever the service is needed.
 * The instance is only created the first time the service is resolved and reused for future
 * resolutions. When the DI container is disposed, all singleton services are also disposed.
 *
 * ### Scoped scope
 *
 * When a service is registered with the `scoped` scope, a new instance is created each
 * time the service is resolved. As soon as the instance is no longer in use, it is
 * disposed.
 */
export type Scope = (typeof SCOPES)[number];

/**
 * Checks if the given object is a valid {@link Scope}.
 *
 * @param {any} obj The object to check.
 *
 * @returns {obj is Scope} Returns `true` if the object is a valid {@link Scope}, `false` otherwise.
 */
export function isScope(obj: any): obj is Scope {
  return SCOPES.includes(obj);
}
