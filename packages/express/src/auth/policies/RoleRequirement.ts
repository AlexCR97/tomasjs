import { Guard, GuardContext, GuardResult } from "@/guards";
import { ClaimRequirement } from "./ClaimRequirement";

export class RoleRequirement implements Guard {
  private readonly roles: ReadonlyArray<string>;

  constructor(...roles: string[]) {
    this.roles = roles;
  }

  isAllowed(context: GuardContext): GuardResult {
    return new ClaimRequirement(
      ...this.roles.map((role) => ({
        key: "role",
        value: role,
      }))
    ).isAllowed(context);
  }
}
