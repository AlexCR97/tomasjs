import { IGetRequest } from "@/core/data/mongo";
import { IMongoRepository } from "@/core/data/mongo/IMongoRepository";
import { PagedResult, PagedResultBuilder } from "@/core/data/responses";
import { User } from "@/core/entities/User";
import { ILogger } from "@/core/logger/ILogger";
import { ILoggerProvider, ILoggerProviderToken } from "@/core/logger/ILoggerProvider";
import { EntityRepository } from "@mikro-orm/mongodb";
import { inject, injectable } from "tsyringe";
import { MongoDb } from "@/infrastructure/data/mongo";

export const IUserRepositoryToken = "IUserRepository";

export interface IUserRepository extends IMongoRepository<User> {}

@injectable()
export class UserRepository implements IUserRepository {
  private readonly logger: ILogger;

  constructor(
    @inject(ILoggerProviderToken) private readonly loggerProvider: ILoggerProvider,
    @inject(MongoDb.name) private readonly mongo: MongoDb
  ) {
    this.logger = this.loggerProvider.createLogger(IUserRepositoryToken, { level: "info" });
    this.logger.debug(`new ${UserRepository.name}`);
  }

  async getAsync(request?: IGetRequest): Promise<PagedResult<User>> {
    // TODO Use request
    const users = await this.repository.findAll();
    return new PagedResultBuilder<User>().setData(users).setTotalCount(users.length).build();
  }

  async getByIdAsync(id: string): Promise<User> {
    return await this.repository.findOneOrFail({ id });
  }

  async createAsync(document: User): Promise<string> {
    const id = await this.repository.nativeInsert(document);
    return id.toString();
  }

  async updateAsync(id: string, document: User): Promise<void> {
    await this.repository.nativeUpdate({ id }, document);
  }

  async deleteAsync(id: string): Promise<void> {
    await this.repository.nativeDelete({ id });
  }

  private get repository(): EntityRepository<User> {
    return this.mongo.em.getRepository(User);
  }
}
