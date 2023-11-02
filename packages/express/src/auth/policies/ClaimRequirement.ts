import { Guard, GuardContext, GuardResult } from "@/guards";
import { Logger, TomasError, TomasLogger } from "@tomasjs/core";
import { ForbiddenResponse } from "@/responses";
import { AuthClaim } from "../AuthClaim";
import { Authentication } from "../Authentication";

export class ClaimRequirement implements Guard {
  private readonly logger: Logger = new TomasLogger(ClaimRequirement.name, "error");
  private readonly claims: ReadonlyArray<AuthClaim>;

  constructor(...claims: AuthClaim[]) {
    this.claims = claims;
  }

  isAllowed({ user }: GuardContext): GuardResult {
    this.logger.debug("Enter");
    this.logger.debug("User is", user);

    if (!user.authenticated || user.claims === null) {
      this.logger.debug("User is not authenticated");

      throw new TomasError(
        `Cannot use authorization if user is not authenticated first. Did you forget to use ${Authentication.name}?`
      );
    }

    this.logger.debug("User is authenticated");

    for (const claim of this.claims) {
      if (!user.hasClaim((x) => x.key === claim.key && x.value === claim.value)) {
        this.logger.debug("User does not have claim", claim);
        return new ForbiddenResponse();
      }

      this.logger.debug("User has claim", claim);
    }

    this.logger.debug("User is authorized");

    return true;
  }
}
