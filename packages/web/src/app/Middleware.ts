import { IServiceProvider } from "@tomasjs/core/dependency-injection";
import { Constructor } from "@tomasjs/core/system";
import { isNotNull, hasLength, isFunction, isInRange } from "@/common";
import { IRequestContext, IResponseWriter } from "@/server";

export type MiddlewareType =
  | MiddlewareFunction
  | IMiddleware
  | Constructor<IMiddleware>
  | IMiddlewareFactory
  | Constructor<IMiddlewareFactory>;

export type NextFunction = () => Promise<void>;

export type MiddlewareFunction = (context: MiddlewareContext) => void | Promise<void>;

export type MiddlewareContext = {
  req: IRequestContext;
  res: IResponseWriter;
  next: NextFunction;
  services: IServiceProvider;
};

export function isMiddlewareFunction(obj: unknown): obj is MiddlewareFunction {
  return isNotNull(obj) && isFunction(obj) && hasLength(obj) && isInRange(obj.length, 0, 1);
}

export interface IMiddleware {
  run(context: MiddlewareContext): void | Promise<void>;
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
