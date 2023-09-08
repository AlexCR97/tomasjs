import { JwtPayload, VerifyErrors, verify } from "jsonwebtoken";
import { JwtVerifyOptions } from "./JwtVerifyOptions";
import { Result, ResultFailure, ResultSuccess } from "@tomasjs/core";

type VerifyResult = JwtPayload;

export class JwtVerifier {
  constructor(private readonly options: JwtVerifyOptions) {}

  verifyAsync(token: string): Promise<ResultFailure<VerifyErrors> | ResultSuccess<VerifyResult>> {
    return new Promise((resolve) => {
      verify(token, this.options.secret, this.options, (err, user) => {
        const result = err !== null ? Result.failure(err) : Result.success(user as VerifyResult);
        return resolve(result);
      });
    });
  }
}
