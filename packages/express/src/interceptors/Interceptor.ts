import { HttpContextWriter } from "@/core";
import { InterceptorResult } from "./InterceptorResult";
import { FunctionChecker } from "@tomasjs/core";

export interface Interceptor {
  intercept(context: HttpContextWriter): InterceptorResult;
}

// TODO Write unit test for this
export function isInterceptorInstance(obj: any): obj is Interceptor {
  if (obj === undefined || obj === null) {
    return false;
  }

  const methodName = "intercept";

  return new FunctionChecker(Reflect.get(obj, methodName))
    .isNotNull()
    .isTypeFunction()
    .isNamed(methodName)
    .hasArgumentCount(1)
    .check();
}
