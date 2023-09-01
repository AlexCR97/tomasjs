import { FunctionChecker } from "@tomasjs/core";
import { QueryHandler } from "./QueryHandler";

// TODO Write test for "isQueryHandler"
export function isQueryHandler<TQuery, TResult>(obj: any): obj is QueryHandler<TQuery, TResult> {
  const functionName = "fetch";

  return new FunctionChecker(obj[functionName])
    .isNotNull()
    .isTypeFunction()
    .isNamed(functionName)
    .hasArgumentCount(1)
    .check();
}
