import { HttpContext } from "tomasjs/core";
import { JsonResponse } from "tomasjs/responses";
import { Endpoint } from "tomasjs/endpoints";
import { JwtMiddlewareFactory } from "../middleware-factories";

export class AuthenticatedEndpoint extends Endpoint {
  constructor() {
    super();
    this.method("post").path("/test-token");
    this.onBefore(JwtMiddlewareFactory);
  }
  handle(context: HttpContext): JsonResponse {
    return new JsonResponse({
      message: "You are authenticated!",
      user: context.user,
    });
  }
}
