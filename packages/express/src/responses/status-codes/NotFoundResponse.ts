import { statusCodes } from "@/core";
import { StatusCodeResponse } from "./StatusCodeResponse";

export class NotFoundResponse extends StatusCodeResponse {
  constructor() {
    super(statusCodes.notFound);
  }
}
