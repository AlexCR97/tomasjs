import { Guard, GuardContext, GuardResult } from "@/guards";
import { TomasError, TomasLogger } from "@tomasjs/core";
import { UseAuthentication } from "../UseAuthentication";

export class AuthenticatedRequirement implements Guard {
  private readonly logger = new TomasLogger(AuthenticatedRequirement.name, "error");

  isAllowed({ user }: GuardContext): GuardResult {
    if (!user.authenticated || user.claims === null) {
      this.logger.debug("User is not authenticated");

      throw new TomasError(
        `Cannot use authorization if user is not authenticated first. Did you forget to use ${UseAuthentication.name}?`
      );
    }

    return true;
  }
}
