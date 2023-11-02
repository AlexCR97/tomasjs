import { GuardType } from "@/guards";

export class Policy {
  constructor(readonly name: string, readonly requirements: ReadonlyArray<PolicyRequirement>) {}
}

export type PolicyRequirement = GuardType;
