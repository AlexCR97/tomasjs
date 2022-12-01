import { NextFunction, Request, Response } from "express";

export type ActionHandler = (req: Request, res: Response) => void;

export type AsyncActionHandler = (req: Request, res: Response) => Promise<void>;

export type MiddlewareHandler = (req: Request, res: Response, next: NextFunction) => void;

export type AsyncMiddlewareHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

export type ControllerActionHandler =
  | ActionHandler
  | AsyncActionHandler
  | MiddlewareHandler
  | AsyncMiddlewareHandler;
