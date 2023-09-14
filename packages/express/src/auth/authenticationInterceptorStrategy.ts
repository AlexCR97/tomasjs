import { InterceptorType } from "@/interceptors";
import { UseAuthenticationOptions } from "./UseAuthentication";
import { JwtInterceptor } from "./jwt";
import { TomasError } from "@tomasjs/core";

export function authenticationInterceptorStrategy(
  options: UseAuthenticationOptions
): InterceptorType {
  if (options.authenticationScheme === "jwt") {
    return jwtInterceptor();
  }

  throw new TomasError(`Unknown authentication scheme "${options.authenticationScheme}"`);

  function jwtInterceptor(): JwtInterceptor {
    if (options.jwtDecoderOptions === undefined) {
      throw new TomasError("Please provide jwtDecoderOptions");
    }

    return new JwtInterceptor(options.jwtDecoderOptions);
  }
}
