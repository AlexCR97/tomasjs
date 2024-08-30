import { Algorithm, verify } from "jsonwebtoken";
import { Claims, IClaims } from "@/auth";
import { Result, ResultFailure, ResultSuccess } from "@tomasjs/core/system";

export type JwtDecoderOptions = {
  secret: string;
  algorithms?: Algorithm[];
  audience?: string | RegExp | Array<string | RegExp>;
  clockTimestamp?: number;
  clockTolerance?: number;
  issuer?: string | string[];
  ignoreExpiration?: boolean;
  ignoreNotBefore?: boolean;
  jwtid?: string;
  nonce?: string;
  subject?: string;
  maxAge?: string | number;
};

export interface IJwtDecoder {
  decode(token: string): Promise<ResultFailure<unknown> | ResultSuccess<IClaims>>;
  decodeOrThrow(token: string): Promise<IClaims>;
}

export class JwtDecoder implements IJwtDecoder {
  constructor(private readonly options: JwtDecoderOptions) {}

  async decode(token: string): Promise<ResultFailure<unknown> | ResultSuccess<IClaims>> {
    try {
      const decodedToken = await this.decodeOrThrow(token);
      return Result.success(decodedToken);
    } catch (err) {
      return Result.failure(err);
    }
  }

  decodeOrThrow(token: string): Promise<IClaims> {
    return new Promise<IClaims>((resolve, reject) => {
      return verify(token, this.options.secret, this.options, (err, decodedToken) => {
        if (err !== null) {
          return reject(err);
        }

        if (decodedToken === undefined) {
          return reject(new TypeError("The jwt was undefined"));
        }

        if (typeof decodedToken === "string") {
          return reject(new TypeError(`The jwt was a string: ${decodedToken}`));
        }

        const claims = new Claims(decodedToken);
        return resolve(claims);
      });
    });
  }
}
