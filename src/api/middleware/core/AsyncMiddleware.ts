import { NextFunction, Request, Response } from "express";

export abstract class AsyncMiddleware {
  abstract handleAsync(req: Request, res: Response, next: NextFunction): Promise<void>;
}
