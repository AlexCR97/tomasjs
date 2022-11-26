import { IRepository } from "@/core/data/IRepository";
import { User } from "@/core/entities/User";
import { ILogger } from "@/core/logger/ILogger";
import { ILoggerProvider, ILoggerProviderToken } from "@/core/logger/ILoggerProvider";
import { EntityRepository } from "@mikro-orm/mongodb";
import { inject, injectable } from "tsyringe";
import { MongoDB } from "../../mongo";

export const IUserRepositoryToken = "IUserRepository";

export interface IUserRepository extends IRepository<User> {}

@injectable()
export class UserRepository implements IUserRepository {
  private readonly logger: ILogger;

  constructor(@inject(ILoggerProviderToken) private readonly loggerProvider: ILoggerProvider) {
    this.logger = this.loggerProvider.createLogger(IUserRepositoryToken);
  }

  async getAsync(): Promise<User[]> {
    try {
      this.logger.debug("Getting users...");
      return await this.repository.findAll();
    } finally {
      this.logger.debug("Got users!");
    }
  }

  private get repository(): EntityRepository<User> {
    return MongoDB.instance.getRepository(User);
  }
}
