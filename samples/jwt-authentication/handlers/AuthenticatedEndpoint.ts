import { HttpContext } from "../../../src/core";
import { JsonResponse } from "../../../src/responses";
import { Endpoint } from "../../../src/endpoints";
import { JwtMiddlewareFactory } from "./factories";

export class AuthenticatedEndpoint extends Endpoint {
  constructor() {
    super();
    this.method("post").path("/test-token");
    this.onBefore(JwtMiddlewareFactory());
  }
  handle(context: HttpContext): JsonResponse {
    return new JsonResponse({
      message: "You are authenticated!",
      user: context.user,
    });
  }
}
