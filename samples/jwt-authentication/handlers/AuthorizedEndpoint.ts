import { HttpContext } from "../../../src/core";
import { JsonResponse } from "../../../src/responses";
import { Endpoint } from "../../../src/endpoints";
import { JwtMiddlewareFactory, RoleClaimMiddlewareFactory } from "../middleware-factories";

export class AuthorizedEndpoint extends Endpoint {
  constructor() {
    super();
    this.method("post").path("/test-claim");
    this.onBefore(new JwtMiddlewareFactory());
    this.onBefore(new RoleClaimMiddlewareFactory());
  }
  handle(context: HttpContext): JsonResponse {
    return new JsonResponse({
      message: "You are authorized!",
      user: context.user,
    });
  }
}
