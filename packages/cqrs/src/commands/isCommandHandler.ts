import { FunctionChecker } from "@tomasjs/core";
import { CommandHandler } from "./CommandHandler";

// TODO Write test for "isCommandHandler"
export function isCommandHandler<TCommand, TResult>(
  obj: any
): obj is CommandHandler<TCommand, TResult> {
  const functionName = "execute";

  return new FunctionChecker(obj[functionName])
    .isNotNull()
    .isTypeFunction()
    .isNamed(functionName)
    .hasArgumentCount(1)
    .check();
}
