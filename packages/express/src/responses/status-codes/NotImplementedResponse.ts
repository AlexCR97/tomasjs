import { statusCodes } from "@/core";
import { StatusCodeResponse } from "./StatusCodeResponse";

export class NotImplementedResponse extends StatusCodeResponse {
  constructor() {
    super(statusCodes.notImplemented);
  }
}
