import { NextFunction, Request, Response } from "express";

export type MiddlewareHandler = (req: Request, res: Response, next: NextFunction) => void;

export type AsyncMiddlewareHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;
