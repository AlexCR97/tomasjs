import { hasLength, isFunction, isNotNull } from "@/common";
import { MiddlewareFunction } from "@/middleware";
import { IRequestContext } from "@/server";

export type InterceptorFunction = (req: IRequestContext) => void | Promise<void>;

export function isInterceptorFunction(obj: unknown): obj is InterceptorFunction {
  return isNotNull(obj) && isFunction(obj) && hasLength(obj) && obj.length === 1;
}

export function interceptor(interceptor: InterceptorFunction): MiddlewareFunction {
  return async (req, _, next) => {
    await interceptor(req);
    return await next();
  };
}
