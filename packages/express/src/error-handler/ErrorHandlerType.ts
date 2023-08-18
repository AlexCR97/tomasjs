import { ClassConstructor } from "@tomasjs/core";
import { ErrorHandler } from "./ErrorHandler";
import { ErrorHandlerFunction } from "./ErrorHandlerFunction";
import { ErrorHandlerFactory } from "./ErrorHandlerFactory";

export type ErrorHandlerType =
  | ErrorHandlerFunction
  | ErrorHandler
  | ClassConstructor<ErrorHandler>
  | ErrorHandlerFactory;
