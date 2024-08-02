import { Middleware } from "@/middleware";
import { IRequestContext, IResponseWriter } from "@/server";

export type ErrorHandler = (
  request: IRequestContext,
  response: IResponseWriter,
  error: any
) => void | Promise<void>;

export function errorHandler(handler: ErrorHandler): Middleware {
  return async (req, res, next) => {
    try {
      await next();
    } catch (err) {
      return await handler(req, res, err);
    }
  };
}
