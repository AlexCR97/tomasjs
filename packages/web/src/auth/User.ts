import { IClaims, Claims } from "./Claims";

export interface IUser {
  get authenticated(): boolean;
  get authorized(): boolean;
  get claims(): IClaims;
  authenticate(claims?: IClaims): boolean;
  authorize(): boolean;
}

export interface IUserReader {
  get authenticated(): boolean;
  get authorized(): boolean;
  get claims(): IClaims;
}

export class User implements IUser {
  private _authenticated = false;
  private _authorized = false;
  private _claims: IClaims = new Claims({});

  get authenticated(): boolean {
    return this._authenticated;
  }

  get authorized(): boolean {
    return this._authorized;
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

  authorize(): boolean {
    if (this._authorized) {
      return false;
    }

    this._authorized = true;
    return true;
  }
}

export class UserReader implements IUserReader {
  constructor(private readonly user: IUser) {}

  get authenticated(): boolean {
    return this.user.authenticated;
  }

  get authorized(): boolean {
    return this.user.authorized;
  }

  get claims(): IClaims {
    return this.user.claims;
  }
}
