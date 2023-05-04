import { FunctionChecker } from "@/core";
import { GuardContext } from "./GuardContext";
import { GuardResult } from "./GuardResult";

export interface Guard {
  isAllowed(context: GuardContext): GuardResult;
}

// TODO Rename to isGuardInstance
// TODO Write unit test
export function isGuardInstance(obj: any): obj is Guard {
  if (obj === undefined || obj === null) {
    return false;
  }

  const methodName = "isAllowed";

  return new FunctionChecker(Reflect.get(obj, methodName))
    .isNotNull()
    .isTypeFunction()
    .isNamed(methodName)
    .hasArgumentCount(1)
    .check();
}
