import { statusCodes } from "@/core";
import { StatusCodeResponse } from "./StatusCodeResponse";

export class BadRequestResponse extends StatusCodeResponse {
  constructor() {
    super(statusCodes.badRequest);
  }
}
