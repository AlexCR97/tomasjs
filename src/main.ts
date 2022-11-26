import "reflect-metadata";
import { container } from "tsyringe";
import { ILoggerProviderToken } from "./core/logger";
import { IUserServiceToken } from "./core/services/user";
import { MongoDB } from "./infrastructure/data/mongo";
import { IUserRepositoryToken, UserRepository } from "./infrastructure/data/repositories/users";
import { WinstonLoggerProvider } from "./infrastructure/logger/winston";
import { UserService } from "./infrastructure/services/user";

async function main(...args: any[]) {
  const logger = new WinstonLoggerProvider().createLogger("main.ts");

  container
    .register(ILoggerProviderToken, { useClass: WinstonLoggerProvider })
    .register(IUserRepositoryToken, { useClass: UserRepository })
    .register(IUserServiceToken, { useClass: UserService });

  await MongoDB.initializeAsync();

  const userService = container.resolve(UserService);
  const users = await userService.getAsync();
  logger.debug("Found users:", { users });
}

main();
