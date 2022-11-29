import "reflect-metadata";
import { DefaultLogger, ILoggerProviderToken } from "./core/logger";
import { IUserServiceToken } from "./core/services/user";
import { IUserRepositoryToken, UserRepository } from "./infrastructure/data/repositories/users";
import { WinstonLoggerProvider } from "./infrastructure/logger/winston";
import "./infrastructure/mapper/MappingProfile";
import { UserService } from "./infrastructure/services/user";
import { ErrorsController, GreeterController } from "./api/controllers";
import {
  ErrorHandlerMiddleware,
  RequestLoggerMiddleware,
  SampleAsyncMiddleware,
} from "./api/middleware";
import { AppBuilder } from "./api/AppBuilder";
import { environment } from "./environment";


async function main(...args: any[]) {
  const logger = new DefaultLogger(main.name);
  logger.debug("main()");

  const app = new AppBuilder();

  app
    .register((container) => {
      container
        .register(ILoggerProviderToken, { useClass: WinstonLoggerProvider })
        .register(IUserRepositoryToken, { useClass: UserRepository })
        .register(IUserServiceToken, { useClass: UserService });
    })
    .useJson()
    .useMiddleware(RequestLoggerMiddleware)
    .useMiddleware(SampleAsyncMiddleware)
    .useBasePath(environment.api.basePath)
    .useController(GreeterController)
    .useController(ErrorsController)
    .useMiddleware(ErrorHandlerMiddleware)
    .useMongoDb()
    .build();
}

main(); // Use main function because initialization of app is asynchronous (async/await is needed)
