import { HttpContext } from "@/core";
import { NextFunction } from "express";

export type ErrorMiddlewareHandler<TError = any> = (
  err: TError,
  context: HttpContext,
  next: NextFunction
) => void | Promise<void>;
