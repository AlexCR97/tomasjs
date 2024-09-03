import { IServiceProvider } from "@tomasjs/core/dependency-injection";
import { Constructor } from "@tomasjs/core/system";
import { isFunction, isInRange, isNotNull } from "@tomasjs/core/system";
import { IRequestContext, IResponseWriter } from "@/server";

export type ErrorHandlerType =
  | ErrorHandlerFunction
  | IErrorHandler
  | Constructor<IErrorHandler>
  | IErrorHandlerFactory
  | Constructor<IErrorHandlerFactory>;

export type ErrorHandlerFunction = (context: ErrorHandlerContext) => void | Promise<void>;

export type ErrorHandlerContext = {
  req: IRequestContext;
  res: IResponseWriter;
  err: unknown;
  services: IServiceProvider;
};

export function isErrorHandlerFunction(obj: unknown): obj is ErrorHandlerFunction {
  return isNotNull(obj) && isFunction(obj) && isInRange(obj.length, 0, 1);
}

export interface IErrorHandler {
  catch(context: ErrorHandlerContext): void | Promise<void>;
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
    return isNotNull(obj) && isFunction(obj) && obj.length === 0;
  }
}
