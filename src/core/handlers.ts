import { NextFunction, Request, Response } from "express";
import { RequestContext } from "./RequestContext";

export type ExpressRequestHandler = (req: Request, res: Response) => void | Promise<void>;

export type ExpressMiddlewareHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

export type RequestHandler<TResponse = void> = (
  context: RequestContext
) => TResponse | Promise<TResponse>;
