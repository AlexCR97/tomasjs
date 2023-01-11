import { ClassConstructor } from "@/container";
import {
  Middleware,
  MiddlewareFactory,
  MiddlewareFactoryHandler,
  MiddlewareHandler,
} from "@/middleware";

export type MiddlewareParam =
  | MiddlewareHandler
  | Middleware
  | ClassConstructor<Middleware>
  | MiddlewareFactoryHandler
  | MiddlewareFactory
  | ClassConstructor<MiddlewareFactory>;
