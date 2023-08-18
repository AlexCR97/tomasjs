import { NextFunction, Request, Response } from "express";

export type ExpressErrorMiddlewareFunction = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => void | Promise<void>;
