import { HttpContext } from "../../../src/core";
import { JwtMiddleware } from "../middleware";
import { JsonResponse } from "../../../src/responses";
import { Endpoint } from "../../../src/endpoints";

export class AuthorizedCallEndpoint extends Endpoint {
  constructor() {
    super();
    this.method("post").path("/token");
    this.onBefore(JwtMiddleware);
  }
  handle(context: HttpContext): JsonResponse {
    return new JsonResponse({
      message: "You are authorized!",
      user: context.user,
    });
  }
}
