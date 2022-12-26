import { ClassConstructor } from "@/container";
import { Middleware } from "./Middleware";
import { MiddlewareFactory } from "./MiddlewareFactory";
import { MiddlewareHandler } from "./MiddlewareHandler";

export type MiddlewareType =
  | MiddlewareHandler
  | Middleware
  | ClassConstructor<Middleware>
  | MiddlewareFactory;
