import { TomasError } from "@/errors";
import { IHttpResponse } from "./HttpResponse";

export class JsonResponseError<T> extends TomasError {
  constructor(readonly response: IHttpResponse<T>) {
    super("core/http/json", "Cannot deserialize response into json");
  }
}
