import { NextFunction, Request, Response } from "express";

export abstract class ErrorMiddleware {
  abstract handle(err: any, req: Request, res: Response, next: NextFunction): void; // TODO Add support for async?
}
