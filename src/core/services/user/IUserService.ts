import { IGetRequest } from "@/core/data/mongo";
import { PagedResult } from "@/core/data/responses";
import { UserModel } from "@/core/models/UserModel";

export const IUserServiceToken = "IUserService";

export interface IUserService {
  getAsync(request?: IGetRequest): Promise<PagedResult<UserModel>>;
  getByIdAsync(id: string): Promise<UserModel>;
  createAsync(model: UserModel): Promise<string>;
  updateAsync(id: string, model: UserModel): Promise<void>;
  deleteAsync(id: string): Promise<void>;
  // TODO Implement CRUD
}
