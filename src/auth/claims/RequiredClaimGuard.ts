import { Guard, guard, GuardContext } from "@/guards";
import { ForbiddenResponse } from "@/responses/status-codes";
import { RequiredClaim } from "./RequiredClaim";

@guard()
export class RequiredClaimGuard implements Guard {
  constructor(private readonly requiredClaim: RequiredClaim) {}

  isAllowed(context: GuardContext): boolean | ForbiddenResponse {
    const claims = context.user?.claims;

    if (claims === undefined || claims === null) {
      return new ForbiddenResponse();
    }

    const hasClaim = Object.keys(claims).some((key) => key === this.requiredClaim.type);

    if (!hasClaim) {
      return new ForbiddenResponse();
    }

    if (this.requiredClaim.value === undefined || this.requiredClaim.value === null) {
      return true;
    }

    const claimValue = claims[this.requiredClaim.type];

    if (claimValue !== this.requiredClaim.value) {
      return new ForbiddenResponse();
    }

    return true;
  }
}
