import { FunctionChecker } from "@tomasjs/core";
import { AppSetupFunction } from "./AppSetupFunction";

export interface AppSetupFactory {
  create(): AppSetupFunction;
}

export function isAppSetupFactory(obj: any): obj is AppSetupFactory {
  const methodName = "create";

  return new FunctionChecker(obj[methodName])
    .isNotNull()
    .isTypeFunction()
    .isNamed(methodName)
    .hasArgumentCount(0)
    .check();
}
