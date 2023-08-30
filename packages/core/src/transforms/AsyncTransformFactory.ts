import { FunctionChecker } from "@/reflection";
import { AsyncTransform } from "./AsyncTransform";
import { AsyncTransformFunction } from "./AsyncTransformFunction";

export interface AsyncTransformFactory<TInput, TOutput> {
  create(): AsyncTransformFunction<TInput, TOutput> | AsyncTransform<TInput, TOutput>;
}

// TODO Write unit test for isAsyncTransformFactory
export function isAsyncTransformFactory<TInput, TOutput>(
  obj: any
): obj is AsyncTransformFactory<TInput, TOutput> {
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
