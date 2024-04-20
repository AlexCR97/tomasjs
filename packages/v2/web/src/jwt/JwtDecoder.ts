import { ErrorOptions, TomasError } from "@tomasjs/core/errors";
import { ResultFailure, ResultSuccess, Result } from "@tomasjs/core/system";
import { VerifyOptions, verify } from "jsonwebtoken";
import { Claims } from "../auth";

export type JwtDecoderResult = ResultFailure<TomasError> | ResultSuccess<Claims>;

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
    return new Promise<JwtDecoderResult>((resolve) => {
      verify(token, this.options.secret, this.options, (err, decodedToken) => {
        if (err !== null) {
          const result = Result.failure(new JwtError({ innerError: err }));
          return resolve(result);
        }

        if (decodedToken === undefined || typeof decodedToken === "string") {
          const result = Result.failure(new JwtError());
          return resolve(result);
        }

        return resolve(Result.success(decodedToken));
      });
    });
  }
}

export class JwtError extends TomasError {
  constructor(options?: ErrorOptions) {
    super("web/Jwt", "Unable to perform jwt-related operation", options);
  }
}
