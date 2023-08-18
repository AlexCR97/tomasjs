import { FunctionChecker } from "@/core";
import { NextFunction, Response, Request } from "express";

export type ErrorHandlerFunction = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

// TODO Write unit test for this
export function isErrorHandlerFunction(obj: any): obj is ErrorHandlerFunction {
  return new FunctionChecker(obj).isNotNull().isTypeFunction().hasArgumentCount(4).check();
}
