import { StatusCodes } from "@/core";
import { StatusCodeResponse } from "./StatusCodeResponse";

export class NotFoundResponse extends StatusCodeResponse {
  constructor() {
    super(StatusCodes.notFound);
  }
}
