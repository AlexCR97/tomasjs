import { ClassConstructor } from "@tomasjs/core";
import { Guard } from "./Guard";
import { GuardFunction } from "./GuardFunction";
import { FunctionChecker } from "@/core";

export interface GuardFactory {
  create(): GuardFunction | Guard | ClassConstructor<Guard>;
}

// TODO Write unit test for this function
export function isGuardFactory(obj: any): obj is GuardFactory {
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
