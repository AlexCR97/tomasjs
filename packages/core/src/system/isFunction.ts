import { isAsyncFunction } from "node:util/types";

/**
 * Determines whether the provided object is a function.
 *
 * This function checks if the given object is a valid function, including both regular
 * functions and asynchronous functions.
 *
 * @param {NonNullable<unknown>} obj - The object to check.
 * @returns {obj is Function} Returns `true` if the object is a function, including async functions; otherwise, `false`.
 *
 * @example
 * const func = () => {};
 * const result = isFunction(func);
 * // result is true
 *
 * @example
 * const asyncFunc = async () => {};
 * const result = isFunction(asyncFunc);
 * // result is true
 *
 * @example
 * const notAFunction = 42;
 * const result = isFunction(notAFunction);
 * // result is false
 */
export function isFunction(obj: NonNullable<unknown>): obj is Function {
  const isFunctionType = typeof obj === "function";
  const isFunctionInstance = obj instanceof Function;

  const proto = Object.getPrototypeOf(obj);
  const isFunctionPrototype = proto === Function.prototype;
  const isAsyncFunctionObj = isAsyncFunction(obj);

  return isFunctionType && isFunctionInstance && (isFunctionPrototype || isAsyncFunctionObj);
}
