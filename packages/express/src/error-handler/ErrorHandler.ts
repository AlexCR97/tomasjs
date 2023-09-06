import { HttpContext, HttpNextFunction } from "@/core";
import { FunctionChecker } from "@tomasjs/core";

export interface ErrorHandler {
  catch(error: any, context: HttpContext, next: HttpNextFunction): void | Promise<void>;
}

// TODO Write unit test
export function isErrorHandlerInstance(obj: any): obj is ErrorHandler {
  if (obj === undefined || obj === null) {
    return false;
  }

  const methodName = "catch";

  return new FunctionChecker(Reflect.get(obj, methodName))
    .isNotNull()
    .isTypeFunction()
    .isNamed(methodName)
    .hasArgumentCount(3)
    .check();
}
