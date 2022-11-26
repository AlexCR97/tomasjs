import { ILogger } from "@/core/logger/ILogger";
import { ILoggerProvider, ILoggerProviderToken } from "@/core/logger/ILoggerProvider";
import { IUserService, IUserServiceToken } from "@/core/services/user/IUserService";
import { IUserRepository, IUserRepositoryToken } from "@/infrastructure/data/repositories/users/UserRepository";
import { inject, injectable } from "tsyringe";

@injectable()
export class UserService implements IUserService {
  private readonly logger: ILogger;

  constructor(
    @inject(ILoggerProviderToken) private readonly loggerProvider: ILoggerProvider,
    @inject(IUserRepositoryToken) private readonly userRepository: IUserRepository
  ) {
    this.logger = this.loggerProvider.createLogger(IUserServiceToken);
  }

  async getAsync(): Promise<any[]> {
    try {
      this.logger.debug("Getting users...");
      return await this.userRepository.getAsync();
    } finally {
      this.logger.debug("Got users!");
    }
  }
}
