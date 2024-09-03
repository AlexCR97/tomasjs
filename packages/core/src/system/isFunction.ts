import { isAsyncFunction } from "util/types";

export function isFunction(obj: NonNullable<unknown>): obj is Function {
  const isFunctionType = typeof obj === "function";
  const isFunctionInstance = obj instanceof Function;

  const proto = Object.getPrototypeOf(obj);
  const isFunctionPrototype = proto === Function.prototype;
  const isAsyncFunctionObj = isAsyncFunction(obj);

  return isFunctionType && isFunctionInstance && (isFunctionPrototype || isAsyncFunctionObj);
}
