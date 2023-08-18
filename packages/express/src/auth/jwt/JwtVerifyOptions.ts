import { VerifyOptions } from "jsonwebtoken";

export interface JwtVerifyOptions extends VerifyOptions {
  secret: string;
}
