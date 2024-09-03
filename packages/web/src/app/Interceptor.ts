import { IServiceProvider } from "@tomasjs/core/dependency-injection";
import { Constructor } from "@tomasjs/core/system";
import { isFunction, isInRange, isNotNull } from "@tomasjs/core/system";
import { IRequestContext } from "@/server";

export type InterceptorType =
  | InterceptorFunction
  | IInterceptor
  | Constructor<IInterceptor>
  | IInterceptorFactory
  | Constructor<IInterceptorFactory>;

export type InterceptorFunction = (context: InterceptorContext) => void | Promise<void>;

export type InterceptorContext = {
  req: IRequestContext;
  services: IServiceProvider;
};

export function isInterceptorFunction(obj: unknown): obj is InterceptorFunction {
  return isNotNull(obj) && isFunction(obj) && isInRange(obj.length, 0, 1);
}

export interface IInterceptor {
  intercept(context: InterceptorContext): void | Promise<void>;
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
    return isNotNull(obj) && isFunction(obj) && obj.length === 0;
  }
}
