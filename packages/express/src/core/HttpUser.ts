import { IdentityClaim } from "./IdentityClaim";

export interface HttpUser {
  readonly authenticated: boolean;
  readonly authorized: boolean;
  readonly claims: IdentityClaim[] | null;
}

class HttpUserImpl implements HttpUser {
  constructor(
    readonly authenticated: boolean,
    readonly authorized: boolean,
    readonly claims: IdentityClaim[] | null
  ) {}
}

export function httpUserFactory(): HttpUserImpl {
  return new HttpUserImpl(false, false, null);
}
