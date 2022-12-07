import { HttpContext } from "@/core";
import { Middleware, ThomasMiddleware } from "@/middleware";
import { ThomasMiddlewareHandler } from "@/middleware/types";
import { constructor } from "tsyringe/dist/typings/types";

export type RequestHandlerMiddleware<T extends Middleware = Middleware> =
  | Middleware
  | constructor<T>;

export type ThomasRequestHandlerMiddleware =
  | ThomasMiddlewareHandler
  | ThomasMiddleware
  | constructor<ThomasMiddleware>;

// TODO Rename to RequestHandler
export type ThomasRequestHandlerCallback<TResponse = void> = (
  context: HttpContext
) => TResponse | Promise<TResponse>;
