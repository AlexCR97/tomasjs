import { FunctionChecker } from "@/reflection";

export type AsyncTransformFunction<TInput, TOutput> = (input: TInput) => Promise<TOutput>;

// TODO Write unit test for isAsyncTransformFunction
export function isAsyncTransformFunction<TInput, TOutput>(
  obj: any
): obj is AsyncTransformFunction<TInput, TOutput> {
  return new FunctionChecker(obj).isNotNull().isTypeFunction().check(); // TODO Improve type check
}
