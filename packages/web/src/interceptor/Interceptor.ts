import { hasLength, isFunction, isNotNull } from "@/common";
import { MiddlewareFunction } from "@/middleware";
import { IRequestContext } from "@/server";

export type InterceptorFunction = (req: IRequestContext) => void | Promise<void>;

export function isInterceptorFunction(obj: unknown): obj is InterceptorFunction {
  return isNotNull(obj) && isFunction(obj) && hasLength(obj) && obj.length === 1;
}

export interface IInterceptor {
  intercept(req: IRequestContext): void | Promise<void>;
}

export function isIInterceptor(obj: unknown): obj is IInterceptor {
  return isNotNull(obj) && isInterceptorFunction((obj as IInterceptor)["intercept"]);
}

export type InterceptorFactoryFunction = () => InterceptorFunction | IInterceptor;

export function isInterceptorFactoryFunction(obj: unknown): obj is InterceptorFactoryFunction {
  return isNotNull(obj) && isFunction(obj) && hasLength(obj) && obj.length === 0;
}

export interface IInterceptorFactory {
  createInterceptor(): InterceptorFunction | IInterceptor;
}

export function isIInterceptorFactory(obj: unknown): obj is IInterceptorFactory {
  return (
    isNotNull(obj) &&
    isInterceptorFactoryFunction((obj as IInterceptorFactory)["createInterceptor"])
  );
}

export function interceptor(interceptor: InterceptorFunction): MiddlewareFunction {
  return async (req, _, next) => {
    await interceptor(req);
    return await next();
  };
}
