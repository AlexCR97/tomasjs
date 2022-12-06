import { HttpMethod } from "@/core";
import { RequestHandler } from "@/core/handlers";
import { Middleware } from "@/middleware";
import { constructor } from "tsyringe/dist/typings/types";

export type ControllerMiddleware<T extends Middleware = Middleware> = Middleware | constructor<T>;

export type ControllerAction = ControllerMiddleware | RequestHandler<any>;

export interface ControllerActionMap {
  method: HttpMethod;
  path: string;
  actions: ControllerAction[];
}
