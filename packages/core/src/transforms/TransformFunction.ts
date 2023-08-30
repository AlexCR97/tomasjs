import { FunctionChecker } from "@/reflection";

export type TransformFunction<TInput, TOutput> = (input: TInput) => TOutput;

// TODO Write unit test for isTransformFunction
export function isTransformFunction<TInput, TOutput>(
  obj: any
): obj is TransformFunction<TInput, TOutput> {
  return new FunctionChecker(obj).isNotNull().isTypeFunction().hasArgumentCount(1).check();
}
