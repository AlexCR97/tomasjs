import { HttpContext, HttpNextFunction } from "@/core";
import { MiddlewareResult } from "./MiddlewareResult";
import { FunctionChecker } from "@tomasjs/core";

export type MiddlewareFunction = (context: HttpContext, next: HttpNextFunction) => MiddlewareResult;

// TODO Write unit test for this
export function isMiddlewareFunction(obj: any): obj is MiddlewareFunction {
  return new FunctionChecker(obj).isNotNull().isTypeFunction().hasArgumentCount(2).check();
}
