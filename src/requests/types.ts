import { Middleware } from "@/middleware";
import { constructor } from "tsyringe/dist/typings/types";

export type RequestHandlerMiddleware<T extends Middleware = Middleware> =
  | Middleware
  | constructor<T>;
