import { ApiRequest } from "../core";

export class GetUsersRequest extends ApiRequest {
  pageIndex?: number;
  pageSize?: number;
}
