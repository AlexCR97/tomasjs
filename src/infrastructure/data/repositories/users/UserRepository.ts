import { IGetRequest } from "@/core/data/mongo";
import { IMongoRepository } from "@/core/data/mongo/IMongoRepository";
import { PagedResult, PagedResultBuilder } from "@/core/data/responses";
import { User } from "@/core/entities/User";
import { ILogger } from "@/core/logger/ILogger";
import { ILoggerProvider, ILoggerProviderToken } from "@/core/logger/ILoggerProvider";
import { EntityRepository } from "@mikro-orm/mongodb";
import { inject, injectable } from "tsyringe";
import { MongoDB } from "../../mongo";

export const IUserRepositoryToken = "IUserRepository";

export interface IUserRepository extends IMongoRepository<User> {}

@injectable()
export class UserRepository implements IUserRepository {
  private readonly logger: ILogger;

  constructor(@inject(ILoggerProviderToken) private readonly loggerProvider: ILoggerProvider) {
    this.logger = this.loggerProvider.createLogger(IUserRepositoryToken);
  }

  async getAsync(request?: IGetRequest | undefined): Promise<PagedResult<User>> {
    // TODO Use request
    try {
      this.logger.debug("Getting users...");
      const users = await this.repository.findAll();
      return new PagedResultBuilder<User>().setData(users).setTotalCount(users.length).build();
    } finally {
      this.logger.debug("Got users!");
    }
  }

  getByIdAsync(id: string): Promise<User> {
    throw new Error("Method not implemented.");
  }

  createAsync(document: User): Promise<string> {
    throw new Error("Method not implemented.");
  }

  updateAsync(id: string, document: User): Promise<void> {
    throw new Error("Method not implemented.");
  }

  deleteAsync(id: string): Promise<void> {
    throw new Error("Method not implemented.");
  }

  private get repository(): EntityRepository<User> {
    return MongoDB.instance.getRepository(User);
  }
}
