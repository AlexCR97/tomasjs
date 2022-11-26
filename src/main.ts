import "reflect-metadata";
import { container } from "tsyringe";
import { ILoggerProviderToken } from "./core/logger/ILoggerProvider";
import { IUserServiceToken } from "./core/services/user/IUserService";
import { IUserRepositoryToken, UserRepository } from "./infrastructure/data/users/UserRepository";
import { WinstonLoggerProvider } from "./infrastructure/logger/winston";
import { UserService } from "./infrastructure/services/user/UserService";

container
  .register(ILoggerProviderToken, { useClass: WinstonLoggerProvider })
  .register(IUserRepositoryToken, { useClass: UserRepository })
  .register(IUserServiceToken, { useClass: UserService });

const userService = container.resolve(UserService);
userService.getAsync();
