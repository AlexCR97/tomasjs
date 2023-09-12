import { ClassConstructor, FunctionChecker } from "@tomasjs/core";
import { ErrorHandlerFunction } from "./ErrorHandlerFunction";
import { ErrorHandler } from "./ErrorHandler";

export interface ErrorHandlerFactory {
  create(): ErrorHandlerFunction | ErrorHandler | ClassConstructor<ErrorHandler>;
}

// TODO Write unit test for this function
export function isErrorHandlerFactory(obj: any): obj is ErrorHandlerFactory {
  if (obj === undefined || obj === null) {
    return false;
  }

  const methodName = "create";

  return new FunctionChecker(Reflect.get(obj, methodName))
    .isNotNull()
    .isTypeFunction()
    .isNamed(methodName)
    .hasArgumentCount(0)
    .check();
}
