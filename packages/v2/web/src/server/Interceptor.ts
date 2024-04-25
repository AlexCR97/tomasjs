import { Middleware } from "./Middleware";
import { IRequestContext } from "./RequestContext";

export type Interceptor = (request: IRequestContext) => void | Promise<void>;

export function interceptor(interceptor: Interceptor): Middleware {
  return async (req, res, next) => {
    await interceptor(req);
    return await next();
  };
}
