import { JwtPayload, VerifyOptions, verify as jsonWebTokenVerify } from "jsonwebtoken";
import { Result, ResultFailure, ResultSuccess, TomasError } from "@tomasjs/core";
import { IdentityClaim } from "@/core";

export type JwtDecoderResult = ResultFailure<TomasError> | ResultSuccess<IdentityClaim[]>;

export type JwtDecoderOptions = {
  secret: string;
} & Pick<
  VerifyOptions,
  | "algorithms"
  | "audience"
  | "clockTimestamp"
  | "clockTolerance"
  | "issuer"
  | "ignoreExpiration"
  | "ignoreNotBefore"
  | "jwtid"
  | "nonce"
  | "subject"
  | "maxAge"
>;

export class JwtDecoder {
  constructor(private readonly options: JwtDecoderOptions) {}

  decode(token: string): Promise<JwtDecoderResult> {
    return new Promise((resolve) => {
      jsonWebTokenVerify(token, this.options.secret, this.options, (err, decodedToken) => {
        if (err !== null) {
          return resolve(Result.failure(err));
        }

        if (decodedToken === undefined || typeof decodedToken === "string") {
          return resolve(
            Result.failure(new TomasError(`Invalid decoded token`, { data: { decodedToken } }))
          );
        }

        const claims = this.toIdentityClaims(decodedToken);
        return resolve(Result.success(claims));
      });
    });
  }

  private toIdentityClaims(payload: JwtPayload): IdentityClaim[] {
    return Object.keys(payload).map((key) => ({
      key,
      value: payload[key],
    }));
  }
}
