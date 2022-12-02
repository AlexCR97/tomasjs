import { BaseResponse } from "./BaseResponse";
import { ResponseOptions } from "./ResponseOptions";

export class PlainTextResponse extends BaseResponse {
  constructor(public readonly data: string, options?: ResponseOptions) {
    super(options);
  }
}
