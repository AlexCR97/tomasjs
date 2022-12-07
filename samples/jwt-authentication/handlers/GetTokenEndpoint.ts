import { HttpContext } from "../../../src/core";
import { OAuthTokenResponse } from "../models";
import { sign } from "jsonwebtoken";
import { AuthOptions } from "./AuthOptions";
import { Endpoint } from "../../../src/endpoints";

export class GetTokenEndpoint extends Endpoint {
  constructor() {
    super();
    this.path("/token");
  }
  handle(context: HttpContext): OAuthTokenResponse {
    const accessToken = sign(AuthOptions.claims, AuthOptions.secret, {
      expiresIn: AuthOptions.expiresIn,
    });
    return {
      access_token: accessToken,
      token_type: "bearer",
    };
  }
}
