import { ClassConstructor } from "@tomasjs/core";
import { ErrorHandler } from "./ErrorHandler";
import { ErrorHandlerFunction } from "./ErrorHandlerFunction";

export type ErrorHandlerType<THandler extends ErrorHandler> =
  | ErrorHandlerFunction
  | THandler
  | ClassConstructor<THandler>;
