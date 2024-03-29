import { HttpUser } from "./HttpUser";
import { IdentityClaim } from "./IdentityClaim";

export interface HttpUserWriter {
  get authenticated(): boolean;
  get authorized(): boolean;
  get claims(): IdentityClaim[] | null;
  authenticate(claims?: IdentityClaim[]): HttpUserWriter;
  authorize(): HttpUserWriter;
  hasClaim(predicate: (claim: IdentityClaim) => boolean): boolean;
}

class HttpUserWriterImpl implements HttpUserWriter {
  constructor(private readonly user: HttpUser) {}

  get authenticated(): boolean {
    return this.user.authenticated;
  }

  get authorized(): boolean {
    return this.user.authorized;
  }

  get claims(): IdentityClaim[] | null {
    return this.user.claims;
  }

  authenticate(claims?: IdentityClaim[]): HttpUserWriter {
    Reflect.set(this.user, <keyof HttpUser>"authenticated", true);
    Reflect.set(this.user, <keyof HttpUser>"claims", claims ?? null);
    return this;
  }

  authorize(): HttpUserWriter {
    Reflect.set(this.user, <keyof HttpUser>"authorized", true);
    return this;
  }

  hasClaim(predicate: (claim: IdentityClaim) => boolean): boolean {
    return this.user.hasClaim(predicate);
  }
}

export function httpUserWriterFactory(user: HttpUser): HttpUserWriter {
  return new HttpUserWriterImpl(user);
}
