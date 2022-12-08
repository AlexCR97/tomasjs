import { environment } from "../environment";
import { ClaimMiddleware } from "../middleware/claim";
import { JwtMiddleware } from "../middleware/jwt";

export const JwtMiddlewareFactory = () => {
  return new JwtMiddleware({
    secret: environment.auth.secret,
  });
};

export const RoleClaimMiddlewareFactory = () => {
  return new ClaimMiddleware({
    claimType: "role",
    claimValue: environment.auth.claims.role,
  });
};
