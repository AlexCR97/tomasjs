import { IMongoRepository } from "@/core/data/mongo/IMongoRepository";
import { User } from "@/core/entities/User";
import { ILogger } from "@/core/logger/ILogger";
import { ILoggerProvider, ILoggerProviderToken } from "@/core/logger/ILoggerProvider";
import { inject, injectable } from "tsyringe";
import { MongoDb } from "@/infrastructure/data/mongo";
import { RecordRepository } from "../core";
import { EntityName } from "@mikro-orm/core";

export const IUserRepositoryToken = "IUserRepository";

export interface IUserRepository extends IMongoRepository<User> {
  getByEmailAsync(email: string): Promise<User>;
}

@injectable()
export class UserRepository extends RecordRepository<User> implements IUserRepository {
  protected entityName: EntityName<User> = User;
  private readonly logger: ILogger;

  constructor(
    @inject(MongoDb.name) mongo: MongoDb,
    @inject(ILoggerProviderToken) private readonly loggerProvider: ILoggerProvider
  ) {
    super(mongo);
    this.logger = this.loggerProvider.createLogger(IUserRepositoryToken, { level: "info" });
    this.logger.debug(`new ${UserRepository.name}`);
  }

  async getByEmailAsync(email: string): Promise<User> {
    return await this.repository.findOneOrFail({ email });
  }
}
