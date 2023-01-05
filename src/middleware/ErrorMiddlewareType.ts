import { ClassConstructor } from "@/container";
import { ErrorMiddleware } from "./ErrorMiddleware";
import { ErrorMiddlewareHandler } from "./ErrorMiddlewareHandler";

export type ErrorMiddlewareType =
  | ErrorMiddlewareHandler
  | ErrorMiddleware
  | ClassConstructor<ErrorMiddleware>;
