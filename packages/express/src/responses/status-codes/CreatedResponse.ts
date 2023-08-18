import { statusCodes } from "@/core";
import { StatusCodeResponse } from "./StatusCodeResponse";

export class CreatedResponse extends StatusCodeResponse {
  constructor() {
    super(statusCodes.created);
  }
}
