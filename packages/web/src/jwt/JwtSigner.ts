import { Algorithm, JwtHeader, sign } from "jsonwebtoken";
import { IClaims } from "@/auth";

export type JwtSignerOptions = {
  secret: string;

  /**
   * Signature algorithm. Could be one of these values :
   * - HS256:    HMAC using SHA-256 hash algorithm (default)
   * - HS384:    HMAC using SHA-384 hash algorithm
   * - HS512:    HMAC using SHA-512 hash algorithm
   * - RS256:    RSASSA using SHA-256 hash algorithm
   * - RS384:    RSASSA using SHA-384 hash algorithm
   * - RS512:    RSASSA using SHA-512 hash algorithm
   * - ES256:    ECDSA using P-256 curve and SHA-256 hash algorithm
   * - ES384:    ECDSA using P-384 curve and SHA-384 hash algorithm
   * - ES512:    ECDSA using P-521 curve and SHA-512 hash algorithm
   * - none:     No digital signature or MAC value included
   */
  algorithm?: Algorithm;
  keyid?: string;

  /** expressed in seconds or a string describing a time span [zeit/ms](https://github.com/zeit/ms.js).  Eg: 60, "2 days", "10h", "7d" */
  expiresIn?: string | number;

  /** expressed in seconds or a string describing a time span [zeit/ms](https://github.com/zeit/ms.js).  Eg: 60, "2 days", "10h", "7d" */
  notBefore?: string | number;

  audience?: string | string[];
  subject?: string;
  issuer?: string;
  jwtid?: string;
  mutatePayload?: boolean;
  noTimestamp?: boolean;
  header?: JwtHeader;
  encoding?: string;
  allowInsecureKeySizes?: boolean;
  allowInvalidAsymmetricKeyTypes?: boolean;
};

export class JwtSigner {
  constructor(private readonly options: JwtSignerOptions) {}

  sign(claims: IClaims): string {
    const optionsWithoutSecret = this.removeKey(this.options, "secret");
    const plainClaims = claims.toPlain();
    return sign(plainClaims, this.options.secret, optionsWithoutSecret);
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
