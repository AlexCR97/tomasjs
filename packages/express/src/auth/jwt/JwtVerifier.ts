import { JwtPayload, verify } from "jsonwebtoken";
import { JwtVerifyOptions } from "./JwtVerifyOptions";

type VerifyResult = string | JwtPayload | undefined;

export abstract class JwtVerifier {
  private constructor() {}

  static verifyAsync(token: string, options: JwtVerifyOptions): Promise<VerifyResult> {
    return new Promise<string | JwtPayload | undefined>((resolve, reject) => {
      verify(token, options?.secret, options, (err, user) => {
        if (err) {
          reject(err);
        } else {
          resolve(user);
        }
      });
    });
  }

  static async tryVerifyAsync(
    token: string,
    options: JwtVerifyOptions
  ): Promise<{ error?: any; result: VerifyResult }> {
    try {
      const result = await this.verifyAsync(token, options);
      return { error: undefined, result };
    } catch (error) {
      return { error, result: undefined };
    }
  }
}
