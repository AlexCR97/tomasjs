import { BaseResponse } from "./BaseResponse";
import { ResponseOptions } from "./ResponseOptions";

export class JsonResponse<T = any> extends BaseResponse {
  constructor(public readonly data: T, options?: ResponseOptions) {
    super(options);
  }
}
