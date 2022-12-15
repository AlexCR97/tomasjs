import { HttpContext } from "@/core";
import { NextFunction } from "express";

export abstract class Middleware {
  abstract handle(context: HttpContext, next: NextFunction): void | Promise<void>;
}
