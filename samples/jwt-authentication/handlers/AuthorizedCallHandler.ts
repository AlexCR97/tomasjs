import { HttpContext } from "../../../src/core";
import { RequestHandler } from "../../../src/requests";
import { JwtMiddleware } from "../middleware";
import { JsonResponse } from "../../../src/responses";

export class AuthorizedCallHandler extends RequestHandler<JsonResponse> {
  constructor() {
    super();
    this.method("post").path("/token");
    this.onBefore(JwtMiddleware);
  }
  handle(context: HttpContext): JsonResponse {
    return new JsonResponse({
      message: "You are authorized!",
      user: (context.response as any).user,
    });
  }
}
