import { HttpContext } from "../../../src/core";
import { RequestHandler } from "../../../src/requests";
import { OAuthTokenResponse } from "../models";
import { sign } from "jsonwebtoken";
import { AuthOptions } from "./AuthOptions";

export class GetTokenHandler extends RequestHandler<OAuthTokenResponse> {
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
