import { JwtDecoder, JwtDecoderOptions } from "./JwtDecoder";
import { AuthenticationPolicyFunction } from "@/auth";

export function jwtPolicy(options: JwtDecoderOptions): AuthenticationPolicyFunction {
  return async ({ req }) => {
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

    return {
      authenticated: true,
      claims: result.data ?? undefined,
    };
  };
}
