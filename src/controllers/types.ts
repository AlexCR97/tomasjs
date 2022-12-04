import { HttpMethod } from "@/core";
import { RequestHandler } from "@/core/handlers";
import { Middleware } from "@/middleware";
import { constructor } from "tsyringe/dist/typings/types";

export interface ControllerActionMap<TResponse = void> {
  method: HttpMethod;
  path: string;
  handler: RequestHandler<TResponse>;
}

export type ControllerMiddleware<T extends Middleware = Middleware> = Middleware | constructor<T>;

export interface ControllerActionOptions {
  onBefore?: ControllerMiddleware[];
  onAfter?: ControllerMiddleware[];
}

export interface ControllerMiddlewareMap {
  method: HttpMethod;
  path: string;
  middleware: ControllerMiddleware;
}
