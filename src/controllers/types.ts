import { HttpMethod } from "@/core";
import { RequestHandler } from "@/core/handlers";
import { Middleware, ThomasMiddleware } from "@/middleware";
import { ThomasMiddlewareHandler } from "@/middleware/types";
import { constructor } from "tsyringe/dist/typings/types";

export type ControllerMiddleware<T extends Middleware = Middleware> = Middleware | constructor<T>;

export type ControllerAction = ControllerMiddleware | RequestHandler<any>;

export interface ControllerActionMap {
  method: HttpMethod;
  path: string;
  actions: ControllerAction[];
}

export type ThomasControllerMiddleware =
  | ThomasMiddlewareHandler
  | ThomasMiddleware
  | constructor<ThomasMiddleware>;
