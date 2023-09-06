import { HttpContext, HttpNextFunction } from "@/core";
import { FunctionChecker } from "@tomasjs/core";

export type ErrorHandlerFunction = (
  error: any,
  context: HttpContext,
  next: HttpNextFunction
) => void | Promise<void>;

// TODO Write unit test for this
export function isErrorHandlerFunction(obj: any): obj is ErrorHandlerFunction {
  return new FunctionChecker(obj).isNotNull().isTypeFunction().hasArgumentCount(3).check();
}
