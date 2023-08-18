import { FunctionChecker } from "@/core";
import { Transform } from "@tomasjs/core";

// TODO Write unit test
export function isTransformInstance<TInput, TOutput>(obj: any): obj is Transform<TInput, TOutput> {
  if (obj === undefined || obj === null) {
    return false;
  }

  const methodName = "transform";

  return new FunctionChecker(Reflect.get(obj, methodName))
    .isNotNull()
    .isTypeFunction()
    .isNamed(methodName)
    .hasArgumentCount(1)
    .check();
}
