import { statusCodes } from "@/core";
import { StatusCodeResponse } from "./StatusCodeResponse";

export class InternalServerErrorResponse extends StatusCodeResponse {
  constructor() {
    super(statusCodes.internalServerError);
  }
}
