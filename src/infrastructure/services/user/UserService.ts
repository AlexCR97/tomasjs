import { IGetRequest } from "@/core/data/mongo";
import { PagedResult, PagedResultBuilder } from "@/core/data/responses";
import { User } from "@/core/entities/User";
import { ILogger, ILoggerProvider, ILoggerProviderToken } from "@/core/logger";
import { UserModel } from "@/core/models/UserModel";
import { IUserService, IUserServiceToken } from "@/core/services/user";
import { IUserRepository, IUserRepositoryToken } from "@/infrastructure/data/repositories/users";
import { Mapper } from "@/infrastructure/mapper";
import { inject, injectable } from "tsyringe";

@injectable()
export class UserService implements IUserService {
  private readonly logger: ILogger;

  constructor(
    @inject(ILoggerProviderToken) private readonly loggerProvider: ILoggerProvider,
    @inject(IUserRepositoryToken) private readonly userRepository: IUserRepository
  ) {
    this.logger = this.loggerProvider.createLogger(IUserServiceToken, { level: "info" });
    this.logger.debug(`new ${UserService.name}`);
  }

  async getAsync(request?: IGetRequest): Promise<PagedResult<UserModel>> {
    const pagedResult = await this.userRepository.getAsync(request);
    return new PagedResultBuilder<UserModel>()
      .setData(Mapper.mapArray(pagedResult.data, User, UserModel))
      .setTotalCount(pagedResult.totalCount)
      .build();
  }

  async getByIdAsync(id: string): Promise<UserModel> {
    const user = await this.userRepository.getByIdAsync(id);
    return Mapper.map(user, User, UserModel);
  }

  async getByEmailAsync(email: string): Promise<UserModel> {
    const user = await this.userRepository.getByEmailAsync(email);
    return Mapper.map(user, User, UserModel);
  }

  async createAsync(model: UserModel): Promise<string> {
    const document = Mapper.map(model, UserModel, User);
    return await this.userRepository.createAsync(document);
  }

  async updateAsync(id: string, model: UserModel): Promise<void> {
    const document = Mapper.map(model, UserModel, User);
    await this.userRepository.updateAsync(id, document);
  }

  async deleteAsync(id: string): Promise<void> {
    await this.userRepository.deleteAsync(id);
  }
}
