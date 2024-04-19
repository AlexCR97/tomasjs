import { Middleware } from "./Middleware";
import { IRequestContext } from "./RequestContext";
import { IResponseWriter } from "./ResponseWriter";

export type ErrorHandler = ErrorHandlerFunction;

export type ErrorHandlerFunction = (
  request: IRequestContext,
  response: IResponseWriter,
  error: any
) => void | Promise<void>;

// TODO Create IErrorHandler interface

export function errorHandlerMiddleware(handler: ErrorHandler): Middleware {
  return async (req, res, next) => {
    try {
      await next();
    } catch (err) {
      return await handler(req, res, err);
    }
  };
}
