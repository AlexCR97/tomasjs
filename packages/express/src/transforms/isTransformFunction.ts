import { FunctionChecker } from "@/core";
import { TransformFunction } from "@tomasjs/core";

// TODO Write unit test for this
export function isTransformFunction<TInput, TOutput>(
  obj: any
): obj is TransformFunction<TInput, TOutput> {
  return new FunctionChecker(obj).isNotNull().isTypeFunction().hasArgumentCount(1).check();
}
