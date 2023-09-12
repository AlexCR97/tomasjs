import { FunctionChecker } from "@tomasjs/core";
import { HttpContext, HttpNextFunction } from "@/core";
import { MiddlewareResult } from "./MiddlewareResult";

export interface Middleware {
  delegate(context: HttpContext, next: HttpNextFunction): MiddlewareResult;
}

// TODO Write unit test for this
export function isMiddlewareInstance(obj: any): obj is Middleware {
  if (obj === undefined || obj === null) {
    return false;
  }

  const methodName = "delegate";

  return new FunctionChecker(Reflect.get(obj, methodName))
    .isNotNull()
    .isTypeFunction()
    .isNamed(methodName)
    .hasArgumentCount(2)
    .check();
}
