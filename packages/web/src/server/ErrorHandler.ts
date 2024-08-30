import { hasLength, isFunction, isInRange, isNotNull } from "@/common";
import { IRequestContext } from "./RequestContext";
import { IResponseWriter } from "./ResponseWriter";
import { MiddlewareFunction } from "./Middleware";

export type ErrorHandlerFunction = (context: ErrorHandlerContext) => void | Promise<void>;

export type ErrorHandlerContext = {
  req: IRequestContext;
  res: IResponseWriter;
  err: unknown;
};

export function isErrorHandlerFunction(obj: unknown): obj is ErrorHandlerFunction {
  return isNotNull(obj) && isFunction(obj) && hasLength(obj) && isInRange(obj.length, 0, 1);
}

export function errorHandler(handler: ErrorHandlerFunction): MiddlewareFunction {
  return async ({ req, res, next }) => {
    try {
      await next();
    } catch (err) {
      return await handler({ req, res, err });
    }
  };
}
