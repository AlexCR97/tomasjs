import "reflect-metadata";
import { container } from "tsyringe";
import { ILoggerProviderToken } from "./core/logger";
import { IUserServiceToken } from "./core/services/user";
import { MongoDB } from "./infrastructure/data/mongo";
import { IUserRepositoryToken, UserRepository } from "./infrastructure/data/repositories/users";
import { WinstonLoggerProvider } from "./infrastructure/logger/winston";
import { UserService } from "./infrastructure/services/user";
import "./infrastructure/mapper/MappingProfile";
import { ApiBuilder, API_BUILDER_TOKEN } from "./api/ApiBuilder";

async function main(...args: any[]) {
  const logger = new WinstonLoggerProvider().createLogger("main.ts");
  logger.debug("Initializing DI container...");

  container
    .register(API_BUILDER_TOKEN, { useClass: ApiBuilder })
    .register(ILoggerProviderToken, { useClass: WinstonLoggerProvider })
    .register(IUserRepositoryToken, { useClass: UserRepository })
    .register(IUserServiceToken, { useClass: UserService });

  logger.debug("DI container initialized!");

  await MongoDB.initializeAsync();

  const apiBuilder = container.resolve(ApiBuilder);
  apiBuilder.build();
}

main();
