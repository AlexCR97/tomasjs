import { Guard, GuardContext, GuardResult } from "@/guards";
import { UnauthorizedResponse } from "..";

export class AuthenticationGuard implements Guard {
  isAllowed({ user }: GuardContext): GuardResult {
    return !user.authenticated ? new UnauthorizedResponse() : true;
  }
}
