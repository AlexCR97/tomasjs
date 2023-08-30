import { FunctionChecker } from "@/reflection";

export interface Transform<TInput, TOutput> {
  transform(input: TInput): TOutput;
}

// TODO Write unit test for isTransformInstance
export function isTransformInstance<TInput, TOutput>(obj: any): obj is Transform<TInput, TOutput> {
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
