import { hasLength, isFunction, isNotNull } from "@/common";
import { MiddlewareFunction } from "@/middleware";
import { IRequestContext, IResponseWriter } from "@/server";

export type ErrorHandlerFunction = (
  req: IRequestContext,
  res: IResponseWriter,
  err: unknown
) => void | Promise<void>;

export function isErrorHandlerFunction(obj: unknown): obj is ErrorHandlerFunction {
  return isNotNull(obj) && isFunction(obj) && hasLength(obj) && obj.length === 3;
}

export function errorHandler(handler: ErrorHandlerFunction): MiddlewareFunction {
  return async (req, res, next) => {
    try {
      await next();
    } catch (err) {
      return await handler(req, res, err);
    }
  };
}
