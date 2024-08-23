import { hasLength, isFunction, isInRange, isNotNull } from "@/common";
import { IResponseWriter } from "@/server";
import { IRequestContext } from "./RequestContext";
import { Constructor } from "@tomasjs/core/system";

export type ErrorHandlerType =
  | ErrorHandlerFunction
  | IErrorHandler
  | Constructor<IErrorHandler>
  | IErrorHandlerFactory
  | Constructor<IErrorHandlerFactory>;

export type ErrorHandlerFunction = (
  req: IRequestContext,
  res: IResponseWriter,
  err: unknown
) => void | Promise<void>;

export function isErrorHandlerFunction(obj: unknown): obj is ErrorHandlerFunction {
  return isNotNull(obj) && isFunction(obj) && hasLength(obj) && isInRange(obj.length, 0, 3);
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
