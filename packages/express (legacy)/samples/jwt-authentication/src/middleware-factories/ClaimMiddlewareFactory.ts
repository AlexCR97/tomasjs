import { MiddlewareFactory } from "tomasjs/middleware";
import { environment } from "../environment";
import { ClaimMiddleware } from "../middleware/claim";

export class RoleClaimMiddlewareFactory extends MiddlewareFactory {
  create() {
    return new ClaimMiddleware({
      claimType: "role",
      claimValue: environment.auth.claims.role,
    });
  }
}
