import { FunctionChecker } from "@/core";
import { NextFunction, Request, Response } from "express";

export interface ErrorHandler {
  catch(error: any, req: Request, res: Response, next: NextFunction): void | Promise<void>;
}

// TODO Write unit test
export function isErrorHandlerInstance(obj: any): obj is ErrorHandler {
  if (obj === undefined || obj === null) {
    return false;
  }

  const methodName = "catch";

  return new FunctionChecker(Reflect.get(obj, methodName))
    .isNotNull()
    .isTypeFunction()
    .isNamed(methodName)
    .hasArgumentCount(4)
    .check();
}
