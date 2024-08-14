import { hasLength, isFunction, isNotNull } from "@/common";
import { IRequestContext } from "./RequestContext";

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

export interface IInterceptorFactory {
  createInterceptor(): InterceptorFunction | IInterceptor;
}

export function isIInterceptorFactory(obj: unknown): obj is IInterceptorFactory {
  return (
    isNotNull(obj) &&
    isInterceptorFactoryFunction((obj as IInterceptorFactory)["createInterceptor"])
  );

  function isInterceptorFactoryFunction(obj: unknown): obj is boolean {
    return isNotNull(obj) && isFunction(obj) && hasLength(obj) && obj.length === 0;
  }
}
