import { NextFunction, Request, Response } from "express";

export abstract class Middleware {
  abstract handle(req: Request, res: Response, next: NextFunction): void;
}
