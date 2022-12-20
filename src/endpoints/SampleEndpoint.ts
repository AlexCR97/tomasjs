import { HttpContext, http } from "@/core";
import { OkResponse } from "@/responses/status-codes";
import { endpoint } from "./@endpoint";
import { path } from "./@path";
import { IEndpoint } from "./IEndpoint";

@endpoint()
@path("path/to/resource")
export class SampleEndpoint implements IEndpoint {
  handle(@http() context: HttpContext) {
    return new OkResponse();
  }
}
