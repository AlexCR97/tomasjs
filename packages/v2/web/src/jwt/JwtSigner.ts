import { Claims } from "@/auth";
import { SignOptions, sign } from "jsonwebtoken";

export type JwtSignerOptions = {
  secret: string;
} & SignOptions;

export class JwtSigner {
  constructor(private readonly options: JwtSignerOptions) {}

  sign(claims: Claims): string {
    const optionsWithoutSecret = this.removeKey(this.options, "secret");
    return sign(claims, this.options.secret, optionsWithoutSecret);
  }

  private removeKey<TObj extends object, TKey extends keyof TObj>(
    obj: TObj,
    key: TKey
  ): Omit<TObj, TKey> {
    const objWithoutKey = { ...obj };

    if (key in objWithoutKey) {
      delete objWithoutKey[key];
    }

    return objWithoutKey;
  }
}
