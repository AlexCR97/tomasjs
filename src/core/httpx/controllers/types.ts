import express from "express";

export type HttpMethod = "get" | "post" | "put" | "delete" | "patch";

export type ActionHandler = (req: express.Request, res: express.Response) => void;

export type AsyncActionHandler = (req: express.Request, res: express.Response) => Promise<void>;

export type MiddlewareHandler = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => void;

export type AsyncMiddlewareHandler = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => Promise<void>;

export type ControllerActionHandler =
  | ActionHandler
  | AsyncActionHandler
  | MiddlewareHandler
  | AsyncMiddlewareHandler;
