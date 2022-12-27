import { ClassConstructor } from "@/container";
import { Middleware } from "./Middleware";
import { MiddlewareFactory } from "./MiddlewareFactory";
import { MiddlewareHandler } from "./MiddlewareHandler";

export type MiddlewareType<TMiddleware extends Middleware = Middleware> =
  | MiddlewareHandler
  | TMiddleware
  | ClassConstructor<TMiddleware>
  | MiddlewareFactory<TMiddleware>;
