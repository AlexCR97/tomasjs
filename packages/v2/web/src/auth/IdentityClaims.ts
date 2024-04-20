import { TomasError } from "@tomasjs/core/errors";

export type PlainIdentityClaims = Readonly<Record<string, string>>;

export interface IIdentityClaims {
  get keys(): (keyof PlainIdentityClaims)[];
  get(key: string): string | null;
  getOrThrow(key: string): string;
  has(key: string): boolean;
  toPlain(): PlainIdentityClaims;
}

export class IdentityClaims implements IIdentityClaims {
  private readonly identityClaims: PlainIdentityClaims;
  private readonly identityClaimsKeys: (keyof PlainIdentityClaims)[];

  constructor(claims: PlainIdentityClaims) {
    this.identityClaims = claims;
    this.identityClaimsKeys = Object.keys(claims);
  }

  get keys(): (keyof PlainIdentityClaims)[] {
    return this.identityClaimsKeys;
  }

  get(key: string): string | null {
    return this.identityClaims[key] ?? null;
  }

  getOrThrow(key: string): string {
    const value = this.get(key);

    if (value === null) {
      throw new ClaimNotFoundError(key);
    }

    return value;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  toPlain(): PlainIdentityClaims {
    return this.identityClaims;
  }
}

export class ClaimNotFoundError extends TomasError {
  constructor(key: string) {
    super("web/ClaimNotFound", `No such claim with key "${key}"`);
  }
}
