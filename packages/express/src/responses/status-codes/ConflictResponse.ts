import { statusCodes } from "@/core";
import { StatusCodeResponse } from "./StatusCodeResponse";

export class ConflictResponse extends StatusCodeResponse {
  constructor() {
    super(statusCodes.conflict);
  }
}
