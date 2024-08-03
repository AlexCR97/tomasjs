import { MiddlewareFunction } from "@/middleware";
import { IRequestContext } from "@/server";

export type Interceptor = (request: IRequestContext) => void | Promise<void>;

export function interceptor(interceptor: Interceptor): MiddlewareFunction {
  return async (req, res, next) => {
    await interceptor(req);
    return await next();
  };
}
