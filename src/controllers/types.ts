import { HttpMethod } from "@/core";
import { RequestHandler } from "@/core/handlers";
import { Middleware, MiddlewareHandler } from "@/middleware";
import { constructor } from "tsyringe/dist/typings/types";

export type ControllerMiddleware<TMiddleware extends Middleware = Middleware> =
  | TMiddleware
  | constructor<TMiddleware>;

export type ControllerAction = ControllerMiddleware | RequestHandler<any>;

export interface ControllerActionMap {
  method: HttpMethod;
  path: string;
  actions: ControllerAction[];
}

export type ThomasControllerMiddleware = MiddlewareHandler | Middleware | constructor<Middleware>;
