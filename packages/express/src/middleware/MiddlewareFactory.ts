import { ClassConstructor } from "@tomasjs/core";
import { FunctionChecker } from "@/core";
import { Middleware } from "./Middleware";
import { MiddlewareFunction } from "./MiddlewareFunction";

export interface MiddlewareFactory {
  create(): MiddlewareFunction | Middleware | ClassConstructor<Middleware>;
}

// TODO Write unit test for this
export function isMiddlewareFactory(obj: any): obj is MiddlewareFactory {
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
