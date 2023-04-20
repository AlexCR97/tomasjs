import {
  Middleware,
  MiddlewareFactory,
  MiddlewareFactoryHandler,
  MiddlewareHandler,
} from "@/middleware";
import { ClassConstructor } from "@tomasjs/core";

export type MiddlewareParam =
  | MiddlewareHandler
  | Middleware
  | ClassConstructor<Middleware>
  | MiddlewareFactoryHandler
  | MiddlewareFactory
  | ClassConstructor<MiddlewareFactory>;
