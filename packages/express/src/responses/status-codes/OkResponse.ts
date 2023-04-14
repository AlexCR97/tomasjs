import { StatusCodes } from "@/core";
import { StatusCodeResponse } from "./StatusCodeResponse";

export class OkResponse extends StatusCodeResponse {
  constructor() {
    super(StatusCodes.ok);
  }
}
