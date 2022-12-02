import { constructor } from "tsyringe/dist/typings/types";
import { Middleware } from "../middleware";

export type OnBeforeMiddleware<TConstructor extends Middleware = any> =
  | Middleware
  | constructor<TConstructor>;
