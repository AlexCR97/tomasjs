import { statusCodes } from "@/core";
import { StatusCodeResponse } from "./StatusCodeResponse";

export class UnauthorizedResponse extends StatusCodeResponse {
  constructor() {
    super(statusCodes.unauthorized);
  }
}
