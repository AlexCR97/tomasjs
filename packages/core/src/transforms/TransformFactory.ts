import { FunctionChecker } from "@/reflection";
import { Transform } from "./Transform";
import { TransformFunction } from "./TransformFunction";

export interface TransformFactory<TInput, TOutput> {
  create(): TransformFunction<TInput, TOutput> | Transform<TInput, TOutput>;
}

// TODO Write unit test for isTransformFactory
export function isTransformFactory<TInput, TOutput>(
  obj: any
): obj is TransformFactory<TInput, TOutput> {
  if (obj === undefined || obj === null) {
    return false;
  }

  const methodName = "create";
  const argumentCount = 0;

  return new FunctionChecker(Reflect.get(obj, methodName))
    .isNotNull()
    .isTypeFunction()
    .isNamed(methodName)
    .hasArgumentCount(argumentCount)
    .check();
}
