import { MiddlewareFactory } from "../../../src/middleware";
import { environment } from "../environment";
import { JwtMiddleware } from "../middleware/jwt";

export class JwtMiddlewareFactory extends MiddlewareFactory {
  create() {
    return new JwtMiddleware({
      secret: environment.auth.secret,
    });
  }
}
