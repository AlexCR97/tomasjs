import { sign } from "jsonwebtoken";
import { JwtSignOptions } from "./JwtSignOptions";

export abstract class JwtSigner {
  private constructor() {}

  static sign(claims: string | Buffer | object, secret: string, options?: JwtSignOptions): string {
    return sign(claims, secret, options);
  }
}
