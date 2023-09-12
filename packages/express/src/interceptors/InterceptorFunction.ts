import { HttpContextWriter } from "@/core";
import { InterceptorResult } from "./InterceptorResult";
import { FunctionChecker } from "@tomasjs/core";

export type InterceptorFunction = (context: HttpContextWriter) => InterceptorResult;

// TODO Write unit test for this
export function isInterceptorFunction(obj: any): obj is InterceptorFunction {
  return new FunctionChecker(obj).isNotNull().isTypeFunction().hasArgumentCount(1).check();
}
