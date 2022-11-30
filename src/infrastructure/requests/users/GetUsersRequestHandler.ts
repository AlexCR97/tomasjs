import { PagedResult, PagedResultBuilder } from "@/core/data/responses";
import { ILogger, ILoggerProvider, ILoggerProviderToken } from "@/core/logger";
import { UserModel } from "@/core/models";
import { Headers, Payload, RequestHandler } from "@/core/requests/core";
import { IRequestContext } from "@/core/requests/core/IRequestContext";
import { GetUsersRequest } from "@/core/requests/users/GetUsersRequest";
import { inject, injectable } from "tsyringe";

@injectable()
export class GetUsersRequestHandler extends RequestHandler<
  Headers,
  GetUsersRequest,
  Payload,
  PagedResult<UserModel>
> {
  private readonly logger: ILogger;

  constructor(@inject(ILoggerProviderToken) readonly loggerProvider: ILoggerProvider) {
    super();
    this.logger = this.loggerProvider.createLogger(GetUsersRequestHandler.name, { level: "info" });
  }

  handle(context: IRequestContext<Headers, GetUsersRequest, Payload>): PagedResult<UserModel> {
    this.logger.info(GetUsersRequestHandler.name, { context });
    return new PagedResultBuilder<UserModel>().setData([]).setTotalCount(0).build();
  }

  // handle(context: IRequestContext<Headers, QueryParams, GetUsersRequest>): PagedResult<UserModel> {
  // }

  // handle(request: GetUsersRequest): PagedResult<UserModel> {
  // }
}
