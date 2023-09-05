import { HttpRequest } from "./HttpRequest";
import { HttpResponse } from "./HttpResponse";
import { HttpUser } from "./HttpUser";

export class HttpContext {
  constructor(
    readonly request: HttpRequest,
    readonly response: HttpResponse,
    readonly user: HttpUser
  ) {}
}
