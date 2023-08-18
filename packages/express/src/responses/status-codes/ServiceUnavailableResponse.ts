import { statusCodes } from "@/core";
import { StatusCodeResponse } from "./StatusCodeResponse";

export class ServiceUnavailableResponse extends StatusCodeResponse {
  constructor() {
    super(statusCodes.serviceUnavailable);
  }
}
