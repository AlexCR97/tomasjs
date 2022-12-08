import { HttpContext } from "../../../src/core";
import { OAuthTokenResponse } from "../models";
import { sign } from "jsonwebtoken";
import { environment } from "../environment";
import { Endpoint } from "../../../src/endpoints";

export class GetTokenEndpoint extends Endpoint {
  constructor() {
    super();
    this.path("/token");
  }
  handle(context: HttpContext): OAuthTokenResponse {
    const accessToken = sign(environment.auth.claims, environment.auth.secret, {
      expiresIn: environment.auth.expiresIn,
    });
    return {
      access_token: accessToken,
      token_type: "bearer",
    };
  }
}
