import { Guard, GuardContext, GuardResult } from "@/guards";
import { UnauthorizedResponse } from "@/responses";

export class AuthenticationGuard implements Guard {
  isAllowed({ user }: GuardContext): GuardResult {
    return !user.authenticated ? new UnauthorizedResponse() : true;
  }
}
