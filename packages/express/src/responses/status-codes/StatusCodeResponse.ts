import { BaseResponse } from "../BaseResponse";

export class StatusCodeResponse extends BaseResponse {
  constructor(status: number) {
    super({ status });
  }
}
