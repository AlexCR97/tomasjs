import { InvalidOperationError } from "@tomasjs/core/errors";
import { AuthorizationPolicyFunction } from "./Authorization";

export type RolePolicyOptions = {
  check?: RolePolicyOptionsCheck;
};

export type RolePolicyOptionsCheck = "any" | "all";

export function rolePolicy(role: string): AuthorizationPolicyFunction;
export function rolePolicy(
  roles: string[],
  options?: RolePolicyOptions
): AuthorizationPolicyFunction;
export function rolePolicy(...args: any[]): AuthorizationPolicyFunction {
  return ({ req }) => {
    const userRoleClaim = req.user.claims.get("role");

    if (userRoleClaim === null) {
      return false;
    }

    if (userRoleClaim.trim().length === 0) {
      return false;
    }

    const userRoles = userRoleClaim.split(" ");

    const [requiredRoleOrRoles, options] = args;

    if (typeof requiredRoleOrRoles === "string") {
      const requiredRole: string = requiredRoleOrRoles;
      return singleRolePolicy(userRoles, requiredRole);
    }

    if (Array.isArray(requiredRoleOrRoles)) {
      const requiredRoles: string[] = requiredRoleOrRoles;
      return multipleRolesPolicy(userRoles, requiredRoles, options);
    }

    throw new InvalidOperationError();
  };

  function singleRolePolicy(userRoles: string[], requiredRole: string): boolean {
    return userRoles.includes(requiredRole);
  }

  function multipleRolesPolicy(
    userRoles: string[],
    requiredRoles: string[],
    options: RolePolicyOptions | undefined
  ): boolean {
    const check = options?.check ?? "any";

    if (check === "any") {
      return requiredRoles.some((role) => userRoles.includes(role));
    }

    if (check === "all") {
      return requiredRoles.every((role) => userRoles.includes(role));
    }

    throw new InvalidOperationError();
  }
}
