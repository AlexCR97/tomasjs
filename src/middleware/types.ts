import { NextFunction, Request, Response } from "express";

export type MiddlewareHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => void | Promise<void>;
