import { Guard, GuardContext } from "@/guards";
import { ForbiddenResponse } from "@/responses/status-codes";
import { RequiredClaim } from "./RequiredClaim";

// TODO Fix RequiredClaimGuard
export class RequiredClaimGuard implements Guard {
  constructor(private readonly requiredClaim: RequiredClaim) {}

  isAllowed({ request, response, user }: GuardContext): boolean | ForbiddenResponse {
    const claims = user.claims;

    if (claims === null) {
      return new ForbiddenResponse();
    }

    const hasClaim = Object.keys(claims).some((key) => key === this.requiredClaim.type);

    if (!hasClaim) {
      return new ForbiddenResponse();
    }

    if (this.requiredClaim.value === undefined || this.requiredClaim.value === null) {
      return true;
    }

    // const claimValue = claims[this.requiredClaim.type];

    // if (claimValue !== this.requiredClaim.value) {
    //   return new ForbiddenResponse();
    // }

    return true;
  }
}
