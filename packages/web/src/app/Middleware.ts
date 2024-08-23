import { isNotNull, hasLength, isInRange, isFunction } from "@/common";
import { IResponseWriter } from "@/server";
import { IRequestContext } from "./RequestContext";
import { Constructor } from "@tomasjs/core/system";

export type NextFunction = () => Promise<void>;

export type MiddlewareType =
  | MiddlewareFunction
  | IMiddleware
  | Constructor<IMiddleware>
  | IMiddlewareFactory
  | Constructor<IMiddlewareFactory>;

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

export interface IMiddlewareFactory {
  createMiddleware(): MiddlewareFunction | IMiddleware;
}

export function isIMiddlewareFactory(obj: unknown): obj is IMiddlewareFactory {
  return (
    isNotNull(obj) && isMiddlewareFactoryFunction((obj as IMiddlewareFactory)["createMiddleware"])
  );

  function isMiddlewareFactoryFunction(obj: unknown): boolean {
    return isNotNull(obj) && isFunction(obj) && hasLength(obj) && obj.length === 0;
  }
}
