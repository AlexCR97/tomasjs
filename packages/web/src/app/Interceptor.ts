import { hasLength, isFunction, isInRange, isNotNull } from "@/common";
import { IRequestContext } from "./RequestContext";
import { Constructor } from "@tomasjs/core/system";

export type InterceptorType =
  | InterceptorFunction
  | IInterceptor
  | Constructor<IInterceptor>
  | IInterceptorFactory
  | Constructor<IInterceptorFactory>;

export type InterceptorFunction = (req: IRequestContext) => void | Promise<void>;

export function isInterceptorFunction(obj: unknown): obj is InterceptorFunction {
  return isNotNull(obj) && isFunction(obj) && hasLength(obj) && isInRange(obj.length, 0, 1);
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
