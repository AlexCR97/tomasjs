import { TomasError } from "@tomasjs/core/errors";

export type PlainClaims = Readonly<Record<string, string>>;

export interface IClaims {
  get keys(): (keyof PlainClaims)[];
  get(key: string): string | null;
  getOrThrow(key: string): string;
  has(key: string): boolean;
  toPlain(): PlainClaims;
}

export class Claims implements IClaims {
  private readonly claims: PlainClaims;
  private readonly claimsKeys: (keyof PlainClaims)[];

  constructor(claims: PlainClaims) {
    this.claims = claims;
    this.claimsKeys = Object.keys(claims);
  }

  get keys(): (keyof PlainClaims)[] {
    return this.claimsKeys;
  }

  get(key: string): string | null {
    return this.claims[key] ?? null;
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

  toPlain(): PlainClaims {
    return this.claims;
  }
}

export class ClaimNotFoundError extends TomasError {
  constructor(key: string) {
    super("web/ClaimNotFound", `No such claim with key "${key}"`);
  }
}
