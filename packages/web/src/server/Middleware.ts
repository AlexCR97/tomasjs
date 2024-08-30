import { isNotNull, hasLength, isInRange, isFunction } from "@/common";
import { IRequestContext, IResponseWriter } from "@/server";

export type NextFunction = () => Promise<void>;

export type MiddlewareFunction = (context: MiddlewareContext) => void | Promise<void>;

export type MiddlewareContext = {
  req: IRequestContext;
  res: IResponseWriter;
  next: NextFunction;
};

export function isMiddlewareFunction(obj: unknown): obj is MiddlewareFunction {
  return isNotNull(obj) && isFunction(obj) && hasLength(obj) && isInRange(obj.length, 0, 1);
}
