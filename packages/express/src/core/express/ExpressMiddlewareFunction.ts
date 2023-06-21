import { NextFunction, Request, Response } from "express";

export type ExpressMiddlewareFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => void | Promise<void>;
