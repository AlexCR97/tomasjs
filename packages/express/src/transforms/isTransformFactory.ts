import { FunctionChecker } from "@/core";
import { TransformFactory } from "@tomasjs/core";

// TODO Write unit test
export function isTransformFactory<TInput, TOutput>(
  obj: any
): obj is TransformFactory<TInput, TOutput> {
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
