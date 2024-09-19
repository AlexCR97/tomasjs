import { Constructor, isConstructor } from "@/system";
import { ServiceFactory, isServiceFactory } from "./ServiceFactory";

/**
 * A token used to identify a dependency in the container.
 *
 * A {@link Token} can be a class constructor, a service factory function, or a simple string value.
 *
 * @template T The type associated with the token.
 */
export type Token<T> = ConstructorToken<T> | ServiceFactoryToken<T> | ValueToken;

/**
 * A token represented by a class constructor that resolves to an instance of type {@link T}.
 *
 * @template T The type of the service being constructed.
 */
export type ConstructorToken<T> = Constructor<T>;

/**
 * A token represented by a service factory function that resolves to a value of type {@link T}.
 *
 * @template T The type of the service being created by the factory.
 */
export type ServiceFactoryToken<T> = ServiceFactory<T>;

/**
 * A token represented by a string value.
 */
export type ValueToken = string;

/**
 * Determines if the provided object is a valid {@link Token}.
 *
 * A token can be a constructor, a service factory, or a string value.
 *
 * @template T The type associated with the token.
 * @param obj - The object to check.
 * @returns `true` if the object is a valid token; otherwise, `false`.
 *
 * @example
 * class MyService {}
 * const factory = () => new MyService();
 *
 * // Example 1: Checking a constructor token
 * const isValidConstructor = isToken(MyService); // true
 *
 * // Example 2: Checking a service factory token
 * const isValidFactory = isToken(factory); // true
 *
 * // Example 3: Checking a value token
 * const token = "myService";
 * const isValidValue = isToken(token); // true
 *
 * // Example 4: Invalid token
 * const invalidToken = 123;
 * const isValidInvalid = isToken(invalidToken); // false
 */
export function isToken<T>(obj: any): obj is Token<T> {
  return isConstructor<T>(obj) || isServiceFactory<T>(obj) || isValueToken(obj);
}

/**
 * Determines if the provided object is a {@link ConstructorToken}.
 *
 * @template T The type instantiated by the constructor.
 * @param obj - The object to check.
 * @returns `true` if the object is a constructor token; otherwise, `false`.
 *
 * @example
 * class MyService {}
 * const isConstructor = isConstructorToken(MyService); // true
 */
export function isConstructorToken<T>(obj: any): obj is ConstructorToken<T> {
  return isConstructor<T>(obj);
}

/**
 * Determines if the provided object is a {@link ServiceFactoryToken}.
 *
 * @template T The return type of the service factory.
 * @param obj - The object to check.
 * @returns `true` if the object is a service factory token; otherwise, `false`.
 *
 * @example
 * const factory = () => new MyService();
 * const isFactory = isServiceFactoryToken(factory); // true
 */
export function isServiceFactoryToken<T>(obj: any): obj is ServiceFactoryToken<T> {
  return isServiceFactory<T>(obj);
}

/**
 * Determines if the provided object is a {@link ValueToken}.
 *
 * @param obj - The object to check.
 * @returns `true` if the object is a value token; otherwise, `false`.
 *
 * @example
 * const token = "myService";
 * const isValue = isValueToken(token); // true
 */
export function isValueToken(obj: any): obj is ValueToken {
  return typeof obj === "string";
}
