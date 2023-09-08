import { IdentityClaim } from "./IdentityClaim";

export interface HttpUser {
  readonly authenticated: boolean;
  readonly authorized: boolean;
  readonly claims: IdentityClaim[] | null;

  hasClaim(key: string, value?: string, type?: string): boolean;
}

class HttpUserImpl implements HttpUser {
  constructor(
    readonly authenticated: boolean,
    readonly authorized: boolean,
    readonly claims: IdentityClaim[] | null
  ) {}

  hasClaim(key: string, value?: string, type?: string): boolean {
    const claims = this.claims ?? [];

    if (key && value && type) {
      return claims.some((x) => x.key === key && x.value === value && x.type === type);
    }

    if (key && value) {
      return claims.some((x) => x.key === key && x.value === value);
    }

    return claims.some((x) => x.key === key);
  }
}

export function httpUserFactory(): HttpUserImpl {
  return new HttpUserImpl(false, false, null);
}
