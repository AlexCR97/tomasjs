import { HttpContext } from "../../../src/core";
import { JwtMiddleware } from "../middleware";
import { JsonResponse } from "../../../src/responses";
import { Endpoint } from "../../../src/endpoints";

export class AuthenticatedEndpoint extends Endpoint {
  constructor() {
    super();
    this.method("post").path("/test-token");
    this.onBefore(JwtMiddleware);
  }
  handle(context: HttpContext): JsonResponse {
    return new JsonResponse({
      message: "You are authenticated!",
      user: context.user,
    });
  }
}
