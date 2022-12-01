import "reflect-metadata";
import "./infrastructure/mapper/MappingProfile";
import { DefaultLogger, ILoggerProviderToken } from "./core/logger";
import { IUserServiceToken } from "./core/services/user";
import { IUserRepositoryToken, UserRepository } from "./infrastructure/data/repositories/users";
import { WinstonLoggerProvider } from "./infrastructure/logger/winston";
import { UserService } from "./infrastructure/services/user";
import { AppBuilder } from "./core/httpx/builder";
import { environment } from "./environment";
import { MikroOrmInstance, MongoDb } from "./infrastructure/data/mongo";
import {
  GetUserByEmailQueryHandler,
  SignUpUserCommandHandler,
  UserCreatedEventHandler,
} from "./infrastructure/cqrs/users";
import { GetUsersRequestHandler } from "./infrastructure/requests/users/GetUsersRequestHandler";
import { HealthCheckRequestHandler } from "./infrastructure/requests/health";
import { UpdateProfileRequestHandler } from "./infrastructure/requests/users";
import {
  ErrorHandlerMiddleware,
  RequestLoggerMiddleware,
  SampleOnBeforeMiddleware,
} from "./infrastructure/httpx/middleware";
import { AnonymousMiddleware } from "./core/httpx/middleware";
import { ErrorsController, GreeterController, UserController } from "./infrastructure/controllers";
import { Request, Response } from "express";

async function main(...args: any[]) {
  const logger = new DefaultLogger(main.name, { level: "debug" });
  logger.debug("environment", { name: environment.name });

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
    .use((exp) => {
      exp.get("/", (req: Request, res: Response) => {
        res.send("Hello World!");
      });
    })
    .useJson()
    .useMiddleware(RequestLoggerMiddleware)
    // .useMiddleware(SampleAsyncMiddleware)
    .useControllersBasePath(environment.api.basePath)
    .useController(GreeterController)
    .useController(ErrorsController)
    .useRequestContext()
    .useRequestHandler("get", "/api/health", HealthCheckRequestHandler, {
      onBefore: new AnonymousMiddleware((req, res, next) => {
        const logger = new DefaultLogger(AnonymousMiddleware.name);
        logger.info(`The ${AnonymousMiddleware.name} got triggered!`);
        next();
      }),
    })
    .useRequestHandler("get", "/api/users/paged", GetUsersRequestHandler, {
      onBefore: SampleOnBeforeMiddleware,
    })
    .useRequestHandler("patch", "/api/users/:id/profile", UpdateProfileRequestHandler, {
      onBefore: [
        new AnonymousMiddleware((req, res, next) => {
          const logger = new DefaultLogger(AnonymousMiddleware.name);
          logger.info(`The ${AnonymousMiddleware.name} got triggered!`);
          next();
        }),
        SampleOnBeforeMiddleware,
      ],
    })
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
