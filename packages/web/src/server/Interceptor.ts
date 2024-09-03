import { isFunction, isInRange, isNotNull } from "@tomasjs/core/system";
import { IRequestContext } from "./RequestContext";
import { MiddlewareFunction } from "./Middleware";

export type InterceptorFunction = (context: InterceptorContext) => void | Promise<void>;

export type InterceptorContext = {
  req: IRequestContext;
};

export function isInterceptorFunction(obj: unknown): obj is InterceptorFunction {
  return isNotNull(obj) && isFunction(obj) && isInRange(obj.length, 0, 1);
}

export function interceptor(interceptor: InterceptorFunction): MiddlewareFunction {
  return async ({ req, next }) => {
    await interceptor({ req });
    return await next();
  };
}
