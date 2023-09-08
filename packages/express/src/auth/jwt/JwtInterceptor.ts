import { HttpContextWriter, IdentityClaim } from "@/core";
import { Interceptor } from "@/interceptors";
import { JwtVerifier } from "./JwtVerifier";
import { JwtVerifyOptions } from "./JwtVerifyOptions";
import { Logger, TomasLogger } from "@tomasjs/core";

export class JwtInterceptor implements Interceptor {
  private readonly logger: Logger = new TomasLogger(JwtInterceptor.name, "debug");

  constructor(private readonly options: JwtVerifyOptions) {}

  async intercept({ request, user }: HttpContextWriter) {
    this.logger.debug("Enter");

    const authHeader = request.getHeaderOrDefault("authorization");

    if (authHeader === undefined) {
      this.logger.debug("Could not find auth header");
      return;
    }

    this.logger.debug("Auth header is", authHeader);

    const accessToken = authHeader.split(" ")[1]; // Bearer {{accessToken}}

    if (accessToken === undefined || accessToken.trim().length === 0) {
      this.logger.debug("Could not find access token");
      return;
    }

    this.logger.debug("Access token is", accessToken);

    const { data, error } = await new JwtVerifier(this.options).verifyAsync(accessToken);

    if (error) {
      this.logger.debug(`Could not verify access token: ${error}`);
      return;
    }

    this.logger.debug("Decoded token is", data);

    const claims: IdentityClaim[] = Object.keys(data).map((key) => ({
      key,
      value: data[key],
    }));

    this.logger.debug("Claims are", claims);

    user.authenticate(claims);

    this.logger.debug("Return");
  }
}
