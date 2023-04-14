import { HttpContext } from "@/core";
import { NextFunction } from "express";

export interface ErrorHandler {
  catch(error: any, context: HttpContext, next: NextFunction): void | Promise<void>;
}
