import { ResponseOptions } from "./ResponseOptions";

export abstract class BaseResponse {
  readonly status?: number;
  constructor(options?: ResponseOptions) {
    this.status = options?.status;
  }
}
