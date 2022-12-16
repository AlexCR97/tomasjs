import { JwtPayload, verify } from "jsonwebtoken";
import { JwtVerifyOptions } from "./JwtVerifyOptions";

export abstract class JwtVerifier {
  static verifyAsync(
    token: string,
    options: JwtVerifyOptions
  ): Promise<string | JwtPayload | undefined> {
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
}
