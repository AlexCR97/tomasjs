import { StatusCodes } from "@/core";
import { StatusCodeResponse } from "./StatusCodeResponse";

export class BadRequestResponse extends StatusCodeResponse {
  constructor() {
    super(StatusCodes.badRequest);
  }
}
