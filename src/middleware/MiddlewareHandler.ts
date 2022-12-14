import { HttpContext } from "@/core";
import { NextFunction } from "express";

export type MiddlewareHandler = (context: HttpContext, next: NextFunction) => void | Promise<void>;

export function isMiddlewareHandler(obj: any): obj is MiddlewareHandler {
  if (typeof obj !== "function") {
    return false;
  }

  const func = obj as Function;

  // Considering that a MiddlewareHandler must be anonymous function...
  return (
    func.name.trim().length === 0 && // The name must be an empty string
    func.prototype === undefined && // The prototype must be undefined
    func.length === 2 && // It must receive 2 arguments
    func.toString().includes("=>") // It must be an arrow function
  );
}
