import { Logger } from "@tomasjs/logging";
import { AppSetupFactory, AppSetupFunction } from "@/builder";
import { ErrorHandlerType } from "./ErrorHandlerType";
import { ErrorHandlerAdapter } from "./ErrorHandlerAdapter";

export class UseErrorHandler implements AppSetupFactory {
  constructor(
    private readonly options: {
      errorHandler: ErrorHandlerType;
      logger?: Logger;
    }
  ) {}

  private get errorHandler(): ErrorHandlerType {
    return this.options.errorHandler;
  }

  private get logger(): Logger | undefined {
    return this.options.logger;
  }

  create(): AppSetupFunction {
    return async (app, container) => {
      const adapter = new ErrorHandlerAdapter({
        container,
        errorHandler: this.errorHandler,
        logger: this.logger,
      });

      const errorHandlerFunction = adapter.adapt();

      app.use(errorHandlerFunction);
    };
  }
}
