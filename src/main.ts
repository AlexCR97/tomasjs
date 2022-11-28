import "reflect-metadata";
import { container, DependencyContainer } from "tsyringe";
import { ILoggerProviderToken } from "./core/logger";
import { IUserServiceToken } from "./core/services/user";
import { MongoDB } from "./infrastructure/data/mongo";
import { IUserRepositoryToken, UserRepository } from "./infrastructure/data/repositories/users";
import { WinstonLoggerProvider } from "./infrastructure/logger/winston";
import "./infrastructure/mapper/MappingProfile";
import { UserService } from "./infrastructure/services/user";
import { ApiBuilder } from "./api/ApiBuilder";
import { ErrorsController, GreeterController } from "./api/controllers";
import {
  ErrorHandlerMiddleware,
  RequestLoggerMiddleware,
  SampleAsyncMiddleware,
} from "./api/middleware";

async function main(...args: any[]) {
  const logger = new WinstonLoggerProvider().createLogger("main.ts");

  logger.debug("Initializing DI container...");

  container
    .register(ApiBuilder.name, ApiBuilder)
    .register(ILoggerProviderToken, { useClass: WinstonLoggerProvider })
    .register(IUserRepositoryToken, { useClass: UserRepository })
    .register(IUserServiceToken, { useClass: UserService });

  logger.debug("DI container initialized!");

  await MongoDB.initializeAsync();

  const apiBuilder = container.resolve(ApiBuilder);
  apiBuilder
    .useBasePath("api")
    .useMiddleware(container.resolve(RequestLoggerMiddleware))
    .useMiddleware(container.resolve(SampleAsyncMiddleware));

  useControllers(container, apiBuilder, [GreeterController, ErrorsController]);

  // ErrorsMiddleware must go right before the .build method
  apiBuilder.useMiddleware(container.resolve(ErrorHandlerMiddleware));
  apiBuilder.build();
}

function useControllers(
  container: DependencyContainer,
  apiBuilder: ApiBuilder,
  controllers: any[]
) {
  for (const controller of controllers) {
    container.register(controller.name, controller);
    const service = container.resolve(controller);
    apiBuilder.useController(service as any);
  }
}

main(); // Use main function because initialization of architecture is asynchronous (async/await is needed)
