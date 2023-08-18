import { statusCodes } from "@/core";
import { StatusCodeResponse } from "./StatusCodeResponse";

export class OkResponse extends StatusCodeResponse {
  constructor() {
    super(statusCodes.ok);
  }
}
