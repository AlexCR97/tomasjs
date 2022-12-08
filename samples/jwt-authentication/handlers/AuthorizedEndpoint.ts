import { HttpContext } from "../../../src/core";
import { ClaimMiddleware } from "../middleware";
import { JsonResponse } from "../../../src/responses";
import { Endpoint } from "../../../src/endpoints";

export class AuthorizedEndpoint extends Endpoint {
  constructor() {
    super();
    this.method("post").path("/test-claim");
    this.onBefore(ClaimMiddleware);
  }
  handle(context: HttpContext): JsonResponse {
    return new JsonResponse({
      message: "You are authorized!",
      user: context.user,
    });
  }
}
