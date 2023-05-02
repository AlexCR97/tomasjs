import { FunctionChecker } from "@/core";
import { NextFunction, Request, Response } from "express";

export interface Middleware {
  handle(req: Request, res: Response, next: NextFunction): void | Promise<void>;
}

export function isMiddleware(obj: any): obj is Middleware {
  if (obj === undefined || obj === null) {
    return false;
  }

  const methodName = "handle";

  return new FunctionChecker(Reflect.get(obj, methodName))
    .isNotNull()
    .isTypeFunction()
    .isNamed(methodName)
    .hasArgumentCount(3)
    .check();
}
