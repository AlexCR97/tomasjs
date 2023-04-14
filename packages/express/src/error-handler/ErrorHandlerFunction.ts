import { HttpContext } from "@/core";
import { NextFunction } from "express";

export type ErrorHandlerFunction = (
  error: any,
  context: HttpContext,
  next: NextFunction
) => void | Promise<void>;
