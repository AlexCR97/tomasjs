import { IIdentityClaims, IdentityClaims } from "./IdentityClaims";

export interface IUser {
  get authenticated(): boolean;
  get claims(): IIdentityClaims;
  authenticate(claims?: IIdentityClaims): boolean;
}

export interface IUserReader {
  get authenticated(): boolean;
  get claims(): IIdentityClaims;
}

export class User implements IUser {
  private _authenticated = false;
  private _claims: IIdentityClaims = new IdentityClaims({});

  get authenticated(): boolean {
    return this._authenticated;
  }

  get claims(): IIdentityClaims {
    return this._claims ?? null;
  }

  authenticate(claims?: IIdentityClaims | undefined): boolean {
    if (this._authenticated) {
      return false;
    }

    this._authenticated = true;
    this._claims = claims ?? new IdentityClaims({});

    return true;
  }
}

export class UserReader implements IUserReader {
  constructor(private readonly user: IUser) {}

  get authenticated(): boolean {
    return this.user.authenticated;
  }

  get claims(): IIdentityClaims {
    return this.user.claims;
  }
}
