import { NextFunction, Request, Response } from "express";

export type ExpressErrorMiddlewareHandler<TError = any> = (
  err: TError,
  req: Request,
  res: Response,
  next: NextFunction
) => void | Promise<void>;
