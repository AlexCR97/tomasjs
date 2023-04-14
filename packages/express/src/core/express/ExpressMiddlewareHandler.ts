import { NextFunction, Request, Response } from "express";

export type ExpressMiddlewareHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => void | Promise<void>;
