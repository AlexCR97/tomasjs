import { ClassConstructor } from "@tomasjs/core";
import { Middleware } from "./Middleware";
import { MiddlewareFactory } from "./MiddlewareFactory";
import { MiddlewareFunction } from "./MiddlewareFunction";

export type MiddlewareType =
  | MiddlewareFunction
  | Middleware
  | ClassConstructor<Middleware>
  | MiddlewareFactory;
