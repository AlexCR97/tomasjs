import { statusCodes } from "@/core";
import { StatusCodeResponse } from "./StatusCodeResponse";

export class ForbiddenResponse extends StatusCodeResponse {
  constructor() {
    super(statusCodes.forbidden);
  }
}
