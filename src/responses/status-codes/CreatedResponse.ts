import { StatusCodes } from "@/core";
import { StatusCodeResponse } from "./StatusCodeResponse";

export class CreatedResponse extends StatusCodeResponse {
  constructor() {
    super(StatusCodes.created);
  }
}
