import { ClassConstructor } from "@/container";
import { Middleware } from "./Middleware";
import { MiddlewareHandler } from "./MiddlewareHandler";

export abstract class MiddlewareFactory<TMiddleware extends Middleware = Middleware> {
  abstract create(): MiddlewareHandler | TMiddleware | ClassConstructor<TMiddleware>;
}
