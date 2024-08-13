import { isNotNull, hasLength, isInRange, isFunction } from "@/common";
import { IRequestContext, IResponseWriter } from "@/server";

export type NextFunction = () => Promise<void>;

export type MiddlewareFunction = (
  req: IRequestContext,
  res: IResponseWriter,
  next: NextFunction
) => void | Promise<void>;

export function isMiddlewareFunction(obj: unknown): obj is MiddlewareFunction {
  return isNotNull(obj) && isFunction(obj) && hasLength(obj) && isInRange(obj.length, 0, 3);
}
