import { PagedResult, PagedResultBuilder } from "@/core/data/responses";
import { User } from "@/core/entities";
import { ILogger, ILoggerProvider, ILoggerProviderToken } from "@/core/logger";
import { UserModel } from "@/core/models";
import { AsyncRequestHandler, RequestContext } from "@/requests";
import { JsonResponse } from "@/responses";
import { IUserRepositoryToken, UserRepository } from "@/infrastructure/data/repositories/users";
import { Mapper } from "@/infrastructure/mapper";
import { inject, injectable } from "tsyringe";

@injectable()
export class GetUsersRequestHandler extends AsyncRequestHandler<
  JsonResponse<PagedResult<UserModel>>
> {
  private readonly logger: ILogger;

  constructor(
    @inject(ILoggerProviderToken) readonly loggerProvider: ILoggerProvider,
    @inject(IUserRepositoryToken) readonly userRepository: UserRepository
  ) {
    super();
    this.logger = this.loggerProvider.createLogger(GetUsersRequestHandler.name, { level: "info" });
    this.logger.debug(`new ${GetUsersRequestHandler.name}`);
  }

  async handleAsync(context: RequestContext): Promise<JsonResponse<PagedResult<UserModel>>> {
    const pagedResult = await this.userRepository.getAsync(context.getQuery());
    return new JsonResponse(
      new PagedResultBuilder<UserModel>()
        .setData(Mapper.mapArray(pagedResult.data, User, UserModel))
        .setTotalCount(pagedResult.totalCount)
        .build()
    );
  }
}
