import { HttpContext } from "@/core";
import { NextFunction } from "express";

export type ErrorMiddlewareHandler<TError = any> = (
  err: TError,
  context: HttpContext,
  next: NextFunction
) => void | Promise<void>;

export function isErrorMiddlewareHandler(obj: any): obj is ErrorMiddlewareHandler {
  if (typeof obj !== "function") {
    return false;
  }

  const func = obj as Function;

  // Considering that a MiddlewareHandler must be anonymous function...
  return (
    func.prototype === undefined && // The prototype must be undefined
    func.length === 3 && // It must receive 3 arguments
    func.toString().includes("=>") // It must be an arrow function
  );
}
