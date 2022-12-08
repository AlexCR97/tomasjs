import { HttpContext } from "../../../src/core";
import { JsonResponse } from "../../../src/responses";
import { Endpoint } from "../../../src/endpoints";
import { JwtMiddlewareFactory, RoleClaimMiddlewareFactory } from "./factories";

export class AuthorizedEndpoint extends Endpoint {
  constructor() {
    super();
    this.method("post").path("/test-claim");
    this.onBefore(JwtMiddlewareFactory());
    this.onBefore(RoleClaimMiddlewareFactory());
  }
  handle(context: HttpContext): JsonResponse {
    return new JsonResponse({
      message: "You are authorized!",
      user: context.user,
    });
  }
}
