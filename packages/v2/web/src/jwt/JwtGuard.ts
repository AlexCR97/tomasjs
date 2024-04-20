import { Guard } from "@/server/Guard";
import { JwtDecoder, JwtDecoderOptions } from "./JwtDecoder";

export function jwtGuard(options: JwtDecoderOptions): Guard {
  return async (req) => {
    const authorization = req.headers["authorization"];

    if (authorization === null || authorization === undefined) {
      return false;
    }

    const authHeaderParts = (authorization as string).split(" "); // {scheme} {token}

    if (authHeaderParts.length !== 2) {
      return false;
    }

    if (authHeaderParts[0] !== "Bearer") {
      return false;
    }

    const token = authHeaderParts[1];

    const result = await new JwtDecoder(options).decode(token);

    if (result.error) {
      return false;
    }

    return true;
  };
}
