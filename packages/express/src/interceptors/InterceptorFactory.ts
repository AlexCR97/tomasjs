import { ClassConstructor, FunctionChecker } from "@tomasjs/core";
import { Interceptor } from "./Interceptor";
import { InterceptorFunction } from "./InterceptorFunction";

export interface InterceptorFactory {
  create(): InterceptorFunction | Interceptor | ClassConstructor<Interceptor>;
}

// TODO Write unit test for this
export function isInterceptorFactory(obj: any): obj is InterceptorFactory {
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
