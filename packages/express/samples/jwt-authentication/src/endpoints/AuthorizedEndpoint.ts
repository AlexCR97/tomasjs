import { HttpContext } from "tomasjs/core";
import { JsonResponse } from "tomasjs/responses";
import { Endpoint } from "tomasjs/endpoints";
import { JwtMiddlewareFactory, RoleClaimMiddlewareFactory } from "../middleware-factories";

export class AuthorizedEndpoint extends Endpoint {
  constructor() {
    super();
    this.method("post").path("/test-claim");
    this.onBefore(JwtMiddlewareFactory);
    this.onBefore(RoleClaimMiddlewareFactory);
  }
  handle(context: HttpContext): JsonResponse {
    return new JsonResponse({
      message: "You are authorized!",
      user: context.user,
    });
  }
}
