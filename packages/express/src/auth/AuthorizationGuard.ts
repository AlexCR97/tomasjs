import { IdentityClaim } from "@/core";
import { Guard, GuardContext, GuardResult } from "@/guards";
import { TomasError } from "@tomasjs/core";
import { ForbiddenResponse } from "..";

export class AuthorizationGuard implements Guard {
  constructor(private readonly claims: IdentityClaim[]) {}

  isAllowed({ user }: GuardContext): GuardResult {
    if (!user.authenticated || user.claims === null) {
      throw new TomasError("Cannot use authorization if user is not authenticated first");
    }

    for (const claim of this.claims) {
      if (!user.hasClaim(claim.key, claim.value, claim.type)) {
        return new ForbiddenResponse();
      }
    }

    return true;
  }
}
