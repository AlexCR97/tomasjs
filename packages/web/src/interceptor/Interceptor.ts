import { MiddlewareFunction } from "@/middleware";
import { IRequestContext } from "@/server";

export type InterceptorFunction = (request: IRequestContext) => void | Promise<void>;

export function interceptor(interceptor: InterceptorFunction): MiddlewareFunction {
  return async (req, res, next) => {
    await interceptor(req);
    return await next();
  };
}
