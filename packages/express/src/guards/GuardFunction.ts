import { FunctionChecker } from "@tomasjs/core";
import { GuardContext } from "./GuardContext";
import { GuardResult } from "./GuardResult";

export type GuardFunction = (context: GuardContext) => GuardResult;

// TODO Write unit test for this
export function isGuardFunction(obj: any): obj is GuardFunction {
  return new FunctionChecker(obj).isNotNull().isTypeFunction().hasArgumentCount(1).check();
}
