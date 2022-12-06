import { NextFunction, Request, Response } from "express";

export abstract class Middleware<T = any> {
  abstract handle(req: Request, res: Response, next: NextFunction): T | Promise<T>;
}
