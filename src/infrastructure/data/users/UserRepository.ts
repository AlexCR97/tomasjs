import { IRepository } from "@/core/data/IRepository";
import { ILogger } from "@/core/logger/ILogger";
import { ILoggerProvider, ILoggerProviderToken } from "@/core/logger/ILoggerProvider";
import { inject, injectable } from "tsyringe";

export const IUserRepositoryToken = "IUserRepository";

export interface IUserRepository extends IRepository<any> {}

@injectable()
export class UserRepository implements IUserRepository {
  private readonly logger: ILogger;

  constructor(@inject(ILoggerProviderToken) private readonly loggerProvider: ILoggerProvider) {
    this.logger = this.loggerProvider.createLogger(IUserRepositoryToken);
  }

  async getAsync(): Promise<any[]> {
    try {
      this.logger.debug("Getting users...");
      return [1, 2, 3, 4, 5];
    } finally {
      this.logger.debug("Got users!");
    }
  }
}
