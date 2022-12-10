import { constructor } from "tsyringe/dist/typings/types";
import { ThomasMiddleware } from "./Middleware";
import { ThomasMiddlewareHandler } from "./types";

export abstract class MiddlewareFactory<TMiddleware extends ThomasMiddleware = ThomasMiddleware> {
  abstract create(): ThomasMiddlewareHandler | TMiddleware | constructor<TMiddleware>;
}
