import { HttpContext } from "@/core";
import { NextFunction } from "express";

export interface Middleware {
  handle(context: HttpContext, next: NextFunction): void | Promise<void>;
}
