import { FunctionChecker } from "@/core";
import { NextFunction, Request, Response } from "express";

export type MiddlewareFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

// TODO Write unit test for this
export function isMiddlewareFunction(obj: any): obj is MiddlewareFunction {
  return new FunctionChecker(obj).isNotNull().isTypeFunction().hasArgumentCount(3).check();
}
