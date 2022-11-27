import { PagedResult } from "../responses";
import { IGetRequest } from "./IGetRequest";

export interface IMongoRepository<T> {
  getAsync(request?: IGetRequest): Promise<PagedResult<T>>;
  getByIdAsync(id: string): Promise<T>;
  createAsync(document: T): Promise<string>;
  updateAsync(id: string, document: T): Promise<void>;
  deleteAsync(id: string): Promise<void>;
}
