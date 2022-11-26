export const IUserServiceToken = "IUserService";

export interface IUserService {
  getAsync(): Promise<any[]>; // TODO Set UserModel
}
