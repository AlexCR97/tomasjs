import { hasLength, isFunction, isNotNull } from "@/common";
import { IResponseWriter } from "@/server";
import { IRequestContext } from "./RequestContext";
import { MiddlewareFunction } from "./Middleware";

export type ErrorHandlerFunction = (
  req: IRequestContext,
  res: IResponseWriter,
  err: unknown
) => void | Promise<void>;

export function isErrorHandlerFunction(obj: unknown): obj is ErrorHandlerFunction {
  return isNotNull(obj) && isFunction(obj) && hasLength(obj) && obj.length === 3;
}

export interface IErrorHandler {
  catch(req: IRequestContext, res: IResponseWriter, err: unknown): void | Promise<void>;
}

export function isIErrorHandler(obj: unknown): obj is IErrorHandler {
  return isNotNull(obj) && isErrorHandlerFunction((obj as IErrorHandler)["catch"]);
}

export interface IErrorHandlerFactory {
  createErrorHandler(): ErrorHandlerFunction | IErrorHandler;
}

export function isIErrorHandlerFactory(obj: unknown): obj is IErrorHandlerFactory {
  return (
    isNotNull(obj) &&
    isErrorHandlerFactoryFunction((obj as IErrorHandlerFactory)["createErrorHandler"])
  );

  function isErrorHandlerFactoryFunction(obj: unknown): boolean {
    return isNotNull(obj) && isFunction(obj) && hasLength(obj) && obj.length === 0;
  }
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
