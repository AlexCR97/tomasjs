import { IRequestContext, IResponseWriter } from "@/server";
import { isFunction, isInRange, isNotNull } from "@tomasjs/core/system";

export type NextFunction = () => Promise<void>;

export type MiddlewareFunction = (context: MiddlewareContext) => void | Promise<void>;

export type MiddlewareContext = {
  req: IRequestContext;
  res: IResponseWriter;
  next: NextFunction;
};

export function isMiddlewareFunction(obj: unknown): obj is MiddlewareFunction {
  return isNotNull(obj) && isFunction(obj) && isInRange(obj.length, 0, 1);
}
