import { NextFunction, Request, Response } from "express";

export type MiddlewareHandler<T = any> = (
  req: Request,
  res: Response,
  next: NextFunction
) => T | Promise<T>;
