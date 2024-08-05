import { isNotNull, hasLength, isInRange, isFunction } from "@/common";
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
