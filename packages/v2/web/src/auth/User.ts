import { IClaims, Claims } from "./Claims";

export interface IUser {
  get authenticated(): boolean;
  get claims(): IClaims;
  authenticate(claims?: IClaims): boolean;
}

export interface IUserReader {
  get authenticated(): boolean;
  get claims(): IClaims;
}

export class User implements IUser {
  private _authenticated = false;
  private _claims: IClaims = new Claims({});

  get authenticated(): boolean {
    return this._authenticated;
  }

  get claims(): IClaims {
    return this._claims ?? null;
  }

  authenticate(claims?: IClaims | undefined): boolean {
    if (this._authenticated) {
      return false;
    }

    this._authenticated = true;
    this._claims = claims ?? new Claims({});

    return true;
  }
}

export class UserReader implements IUserReader {
  constructor(private readonly user: IUser) {}

  get authenticated(): boolean {
    return this.user.authenticated;
  }

  get claims(): IClaims {
    return this.user.claims;
  }
}
