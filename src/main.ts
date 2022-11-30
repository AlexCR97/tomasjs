import "reflect-metadata";
import "./infrastructure/mapper/MappingProfile";
import { DefaultLogger, ILoggerProviderToken } from "./core/logger";
import { IUserServiceToken } from "./core/services/user";
import { IUserRepositoryToken, UserRepository } from "./infrastructure/data/repositories/users";
import { WinstonLoggerProvider } from "./infrastructure/logger/winston";
import { UserService } from "./infrastructure/services/user";
import { ErrorsController, GreeterController, UserController } from "./api/controllers";
import { ErrorHandlerMiddleware, RequestLoggerMiddleware } from "./api/middleware";
import { AppBuilder } from "./api/AppBuilder";
import { environment } from "./environment";
import { MikroOrmInstance, MongoDb } from "./infrastructure/data/mongo";
import {
  GetUserByEmailQueryHandler,
  SignUpUserCommandHandler,
  UserCreatedEventHandler,
} from "./infrastructure/cqrs/users";
import { GetUsersRequestHandler } from "./infrastructure/requests/users/GetUsersRequestHandler";

async function main(...args: any[]) {
  const logger = new DefaultLogger(main.name, { level: "debug" });
  logger.debug("environment", environment);

  const app = new AppBuilder();

  // IMPORTANT: Order of registration matters!

  /* #region MongoDB */
  await (async () => {
    await MikroOrmInstance.initializeAsync({
      connectionString: environment.mongo.connectionString,
      database: environment.mongo.database,
      entities: environment.mongo.entities,
      entitiesTs: environment.mongo.entitiesTs,
    });

    app.register((container) => {
      container.register(MongoDb.name, { useClass: MongoDb });
    });
  })();
  /* #endregion */

  app
    .register((container) => {
      container
        .register(ILoggerProviderToken, { useClass: WinstonLoggerProvider })
        .register(IUserRepositoryToken, { useClass: UserRepository })
        .register(IUserServiceToken, { useClass: UserService });
    })
    .useJson()
    .useMiddleware(RequestLoggerMiddleware)
    // .useMiddleware(SampleAsyncMiddleware)
    .useControllersBasePath(environment.api.basePath)
    .useController(GreeterController)
    .useController(ErrorsController)
    .useRequestHandler("get", "/api/users/paged", GetUsersRequestHandler)
    .useController(UserController)
    .useQueryHandler(GetUserByEmailQueryHandler)
    .useCommandHandler(SignUpUserCommandHandler)
    .useEventHandler(UserCreatedEventHandler)
    .useSpa({
      // NOTE: Put .useSpa after controllers so it does not clash with api
      spaPath: environment.host.webPath,
    })
    .useMiddleware(ErrorHandlerMiddleware); // The ErrorHandlerMiddleware must always go last

  app.build();
}

main(); // Use main function because initialization of app is asynchronous (async/await is needed)
