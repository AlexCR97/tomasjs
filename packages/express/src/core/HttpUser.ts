import { IdentityClaim } from "./IdentityClaim";

export interface HttpUser {
  readonly authenticated: boolean;
  readonly authorized: boolean;
  readonly claims: IdentityClaim[] | null;

  hasClaim(predicate: (claim: IdentityClaim) => boolean): boolean;
}

class HttpUserImpl implements HttpUser {
  constructor(
    readonly authenticated: boolean,
    readonly authorized: boolean,
    readonly claims: IdentityClaim[] | null
  ) {}

  hasClaim(predicate: (claim: IdentityClaim) => boolean): boolean {
    return this.claims === null ? false : this.claims.some(predicate);
  }
}

export function httpUserFactory(): HttpUserImpl {
  return new HttpUserImpl(false, false, null);
}
