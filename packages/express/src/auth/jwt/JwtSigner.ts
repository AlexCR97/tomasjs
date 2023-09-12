import { SignOptions, sign as jsonWebTokenSign } from "jsonwebtoken";
import { removeKey } from "@/common";

export type JwtSignerOptions = {
  secret: string;
} & SignOptions;

export class JwtSigner {
  constructor(private readonly options: JwtSignerOptions) {}

  sign(claims: string | Buffer | object): string {
    const optionsWithoutSecret = removeKey(this.options, "secret");
    return jsonWebTokenSign(claims, this.options.secret, optionsWithoutSecret);
  }
}
