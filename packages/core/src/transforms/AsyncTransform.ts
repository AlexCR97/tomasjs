import { FunctionChecker } from "@/reflection";

export interface AsyncTransform<TInput, TOutput> {
  transform(input: TInput): Promise<TOutput>;
}

// TODO Write unit test for isAsyncTransformInstance
export function isAsyncTransformInstance<TInput, TOutput>(
  obj: any
): obj is AsyncTransform<TInput, TOutput> {
  if (obj === undefined || obj === null) {
    return false;
  }

  const methodName = "transform";
  const argumentCount = 1;

  return new FunctionChecker(Reflect.get(obj, methodName))
    .isNotNull()
    .isTypeFunction()
    .isNamed(methodName)
    .hasArgumentCount(argumentCount)
    .check();
}
