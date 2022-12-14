import { constructor } from "tsyringe/dist/typings/types";
import { Middleware } from "./Middleware";
import { MiddlewareHandler } from "./MiddlewareHandler";

export abstract class MiddlewareFactory<TMiddleware extends Middleware = Middleware> {
  abstract create(): MiddlewareHandler | TMiddleware | constructor<TMiddleware>;
}
