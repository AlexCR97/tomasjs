import { ClassConstructor } from "@tomasjs/core";
import { ErrorHandler } from "./ErrorHandler";
import { ErrorHandlerFactory } from "./ErrorHandlerFactory";
import { ErrorHandlerFunction } from "./ErrorHandlerFunction";
import { TomasErrorHandler } from "./TomasErrorHandler";
import { Logger } from "@tomasjs/logging";

export class TomasErrorHandlerFactory implements ErrorHandlerFactory {
  constructor(
    private readonly options?: {
      includeStackTrace?: boolean;
      logger: Logger;
    }
  ) {}

  create(): ErrorHandlerFunction | ErrorHandler | ClassConstructor<ErrorHandler> {
    return new TomasErrorHandler(this.options);
  }
}
