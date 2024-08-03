import { IRequestContext, IResponseWriter } from "@/server";

export type NextFunction = () => Promise<void>;

export type MiddlewareFunction = (
  req: IRequestContext,
  res: IResponseWriter,
  next: NextFunction
) => void | Promise<void>;

export function isMiddlewareFunction(obj: unknown): obj is MiddlewareFunction {
  return isNotNull(obj) && isFunction(obj) && hasLength(obj) && isInRange(obj.length, 0, 3);
}

export interface IMiddleware {
  run(req: IRequestContext, res: IResponseWriter, next: NextFunction): void | Promise<void>;
}

export function isIMiddleware(obj: unknown): obj is IMiddleware {
  return isNotNull(obj) && isMiddlewareFunction((obj as IMiddleware)["run"]);
}

export type MiddlewareFactoryFunction = () => MiddlewareFunction | IMiddleware;

export function isMiddlewareFactoryFunction(obj: unknown): obj is MiddlewareFactoryFunction {
  return isNotNull(obj) && isFunction(obj) && hasLength(obj) && obj.length === 0;
}

export interface IMiddlewareFactory {
  createMiddleware(): MiddlewareFunction | IMiddleware;
}

export function isIMiddlewareFactory(obj: unknown): obj is IMiddlewareFactory {
  return (
    isNotNull(obj) && isMiddlewareFactoryFunction((obj as IMiddlewareFactory)["createMiddleware"])
  );
}

// TODO Move to @tomasjs/core/system
function isNotNull<T>(obj: T): obj is NonNullable<T> {
  return obj !== undefined && obj !== null;
}

// TODO Move to @tomasjs/core/system
function isFunction(obj: NonNullable<unknown>): obj is Function {
  const isFunctionType = typeof obj === "function";
  const isFunctionInstance = obj instanceof Function;
  const isFunctionPrototype = Object.getPrototypeOf(obj) === Function.prototype;
  return isFunctionType && isFunctionInstance && isFunctionPrototype;
}

function hasLength(obj: NonNullable<unknown>): obj is { length: number } {
  return typeof (obj as any)["length"] === "number";
}

// TODO Move to @tomasjs/core/system
function isInRange(num: number, min: number, max: number): boolean {
  return num >= min && num <= max;
}
