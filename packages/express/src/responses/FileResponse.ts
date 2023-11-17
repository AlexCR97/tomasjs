import { BaseResponse } from "./BaseResponse";
import { ResponseOptions } from "./ResponseOptions";

export class FileResponse extends BaseResponse {
  constructor(readonly path: string, options?: ResponseOptions) {
    super(options);
  }
}
