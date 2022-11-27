import { IGetRequest } from "@/core/data/mongo";
import { PagedResult } from "@/core/data/responses";
import { UserModel } from "@/core/models/UserModel";

export const IUserServiceToken = "IUserService";

export interface IUserService {
  getAsync(request?: IGetRequest): Promise<PagedResult<UserModel>>;
  // TODO Implement CRUD
}
