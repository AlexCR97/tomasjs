import { StatusCodes } from "@/core";
import { StatusCodeResponse } from "./StatusCodeResponse";

export class NoContentResponse extends StatusCodeResponse {
  constructor() {
    super(StatusCodes.noContent);
  }
}
