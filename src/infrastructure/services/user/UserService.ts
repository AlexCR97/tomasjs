import { IGetRequest } from "@/core/data/mongo";
import { PagedResult, PagedResultBuilder } from "@/core/data/responses";
import { User } from "@/core/entities/User";
import { ILogger } from "@/core/logger/ILogger";
import { ILoggerProvider, ILoggerProviderToken } from "@/core/logger/ILoggerProvider";
import { UserModel } from "@/core/models/UserModel";
import { IUserService, IUserServiceToken } from "@/core/services/user/IUserService";
import {
  IUserRepository,
  IUserRepositoryToken,
} from "@/infrastructure/data/repositories/users/UserRepository";
import { Mapper } from "@/infrastructure/mapper";
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

  async getAsync(request?: IGetRequest | undefined): Promise<PagedResult<UserModel>> {
    try {
      this.logger.debug("Getting users...");

      const pagedResult = await this.userRepository.getAsync(request);

      return new PagedResultBuilder<UserModel>()
        .setData(Mapper.mapArray(pagedResult.data, User, UserModel))
        .setTotalCount(pagedResult.totalCount)
        .build();
    } finally {
      this.logger.debug("Got users!");
    }
  }
}
