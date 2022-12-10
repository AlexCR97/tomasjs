import { HttpContext } from "@/core";
import { NextFunction, Request, Response } from "express";

export type ExpressMiddlewareHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

export type ThomasMiddlewareHandler = (
  context: HttpContext,
  next: NextFunction
) => void | Promise<void>;

export function isThomasMiddlewareHandler(obj: any): obj is ThomasMiddlewareHandler {
  if (typeof obj !== "function") {
    return false;
  }

  const func = obj as Function;

  // Considering that a ThomasMiddlewareHandler must be anonymous function...
  return (
    func.name.trim().length === 0 && // The name must be an empty string
    func.prototype === undefined && // The prototype must be undefined
    func.length === 2 && // It must receive 2 arguments
    func.toString().includes("=>") // It must be an arrow function
  );
}

// TODO Deprecate this and use ThomasMiddlewareHandler
export type MiddlewareHandler<T = any> = (
  req: Request,
  res: Response,
  next: NextFunction
) => T | Promise<T>;

export type ExpressErrorMiddlewareHandler<TError = any> = (
  err: TError,
  req: Request,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

export type ThomasErrorMiddlewareHandler<TError = any> = (
  err: TError,
  context: HttpContext,
  next: NextFunction
) => void | Promise<void>;
