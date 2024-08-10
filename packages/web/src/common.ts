import { isAsyncFunction } from "node:util/types";

// TODO Move to @tomasjs/core/system
export function isNotNull<T>(obj: T): obj is NonNullable<T> {
  return obj !== undefined && obj !== null;
}

// TODO Move to @tomasjs/core/system
export function isFunction(obj: NonNullable<unknown>): obj is Function {
  const isFunctionType = typeof obj === "function";
  const isFunctionInstance = obj instanceof Function;

  const proto = Object.getPrototypeOf(obj);
  const isFunctionPrototype = proto === Function.prototype;
  const isAsyncFunctionObj = isAsyncFunction(obj);

  return isFunctionType && isFunctionInstance && (isFunctionPrototype || isAsyncFunctionObj);
}

export function hasLength(obj: NonNullable<unknown>): obj is { length: number } {
  return typeof (obj as any)["length"] === "number";
}

// TODO Move to @tomasjs/core/system
export function isInRange(num: number, min: number, max: number): boolean {
  return num >= min && num <= max;
}

// TODO Move to @tomasjs/core/system
export async function timeout(milliseconds: number): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(() => resolve(), milliseconds);
  });
}
