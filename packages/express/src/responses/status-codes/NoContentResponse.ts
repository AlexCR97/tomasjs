import { statusCodes } from "@/core";
import { StatusCodeResponse } from "./StatusCodeResponse";

export class NoContentResponse extends StatusCodeResponse {
  constructor() {
    super(statusCodes.noContent);
  }
}
