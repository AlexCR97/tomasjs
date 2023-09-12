import { Logger, TomasLogger } from "@tomasjs/core";
import { HttpContextWriter } from "@/core";
import { Interceptor } from "@/interceptors";
import { JwtDecoder, JwtDecoderOptions } from "./JwtDecoder";

export class JwtInterceptor implements Interceptor {
  private readonly logger: Logger = new TomasLogger(JwtInterceptor.name, "error");

  constructor(private readonly options: JwtDecoderOptions) {}

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

    const { data: claims, error } = await new JwtDecoder(this.options).decode(accessToken);

    if (error) {
      this.logger.debug(`Could not decode access token: ${error}`);
      return;
    }

    this.logger.debug("Claims are", claims);

    user.authenticate(claims);

    this.logger.debug("Return");
  }
}
