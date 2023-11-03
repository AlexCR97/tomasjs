import { AuthClaim } from "./AuthClaim";
import {
  ContainerSetupFactory,
  ContainerSetupFunction,
  NotImplementedError,
  TomasError,
} from "@tomasjs/core";
import { Policy, PolicyRequirement } from "./policies/Policy";
import { ClaimRequirement } from "./policies/ClaimRequirement";
import { RoleRequirement } from "./policies";

export class Authorization implements ContainerSetupFactory {
  constructor(policies: Policy[]);
  constructor(options: AuthorizationOptions);
  constructor(configure: AuthorizationOptionsConfiguration);
  constructor(private readonly options: AuthorizationParam) {}

  create(): ContainerSetupFunction {
    return async (container) => {
      const options = this.getAuthorizationOptions();
      container.addInstance(options, AuthorizationOptions);
    };
  }

  private getAuthorizationOptions(): AuthorizationOptions {
    if (Array.isArray(this.options)) {
      return new AuthorizationOptions(this.options);
    }

    if (this.options instanceof AuthorizationOptions) {
      return this.options;
    }

    return this.buildAuthorizationOptions(this.options);
  }

  private buildAuthorizationOptions(
    configure: AuthorizationOptionsConfiguration
  ): AuthorizationOptions {
    const options = new AuthorizationOptions([]);
    configure(options);
    return options;
  }
}

export type AuthorizationParam =
  | Policy[]
  | AuthorizationOptions
  | AuthorizationOptionsConfiguration;

export class AuthorizationOptions {
  constructor(private readonly _policies: Policy[]) {}

  get policies(): ReadonlyArray<Policy> {
    return this._policies;
  }

  addPolicy(policy: Policy): AuthorizationOptions;
  addPolicy(name: string, requirements: PolicyRequirement[]): AuthorizationOptions;
  addPolicy(name: string, configure: (rules: PolicyRules) => void): AuthorizationOptions;
  addPolicy(arg1: any, arg2?: any): AuthorizationOptions {
    if (arg1 instanceof Policy) {
      return this.addPolicyInstance(arg1);
    }

    if (typeof arg1 === "string" && Array.isArray(arg2)) {
      return this.addPolicyWithRequirements(arg1, arg2);
    }

    if (typeof arg1 === "string" && typeof arg2 === "function") {
      return this.addPolicyWithRules(arg1, arg2);
    }

    throw new NotImplementedError(this.addPolicy.name);
  }

  private addPolicyInstance(policy: Policy): AuthorizationOptions {
    this._policies.push(policy);
    return this;
  }

  private addPolicyWithRequirements(
    name: string,
    requirements: PolicyRequirement[]
  ): AuthorizationOptions {
    this._policies.push(new Policy(name, requirements));
    return this;
  }

  private addPolicyWithRules(
    name: string,
    configure: (rules: PolicyRules) => void
  ): AuthorizationOptions {
    const rules = new PolicyRules();
    configure(rules);
    this._policies.push(new Policy(name, rules.requirements));
    return this;
  }

  getPolicy(name: string): Policy {
    const policy = this.policies.find((x) => x.name === name);

    if (policy === undefined) {
      throw new TomasError(`No such policy "${name}".`, { data: { policy: name } });
    }

    return policy;
  }
}

export type AuthorizationOptionsConfiguration = (options: AuthorizationOptions) => void;

export class PolicyRules {
  private readonly _requirements: PolicyRequirement[] = [];

  get requirements(): ReadonlyArray<PolicyRequirement> {
    return this._requirements;
  }

  require(requirement: PolicyRequirement): PolicyRules {
    this._requirements.push(requirement);
    return this;
  }

  requireClaim(...claim: AuthClaim[]): PolicyRules {
    this._requirements.push(new ClaimRequirement(...claim));
    return this;
  }

  requireRole(...role: string[]): PolicyRules {
    this._requirements.push(new RoleRequirement(...role));
    return this;
  }
}
