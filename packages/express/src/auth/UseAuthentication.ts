import { AppSetupFactory, AppSetupFunction } from "@/builder";
import { UseGuards } from "@/guards";
import { AuthenticationGuard } from "./AuthenticationGuard";
import { UseInterceptors } from "@/interceptors";
import { JwtInterceptor } from "./jwt/JwtInterceptor";
import { Container, TomasError } from "@tomasjs/core";
import { Express } from "express";
import { JwtDecoderOptions } from "./jwt";

export interface UseAuthenticationOptions {
  authenticationScheme: "jwt";
  jwtDecoderOptions?: JwtDecoderOptions;
}

export class UseAuthentication implements AppSetupFactory {
  constructor(private readonly options: UseAuthenticationOptions) {}

  create(): AppSetupFunction {
    return async (app, container) => {
      await this.useAuthScheme(app, container);
      await this.useAuthGuard(app, container);
    };
  }

  private async useAuthScheme(app: Express, container: Container) {
    if (this.options.authenticationScheme === "jwt") {
      return await this.useJwtAuthScheme(app, container);
    }

    throw new TomasError(`Unknown authentication scheme "${this.options.authenticationScheme}"`);
  }

  private async useJwtAuthScheme(app: Express, container: Container) {
    if (this.options.jwtDecoderOptions === undefined) {
      throw new TomasError("Please provider jwtVerifyOptions");
    }

    const factory = new UseInterceptors({
      interceptors: [new JwtInterceptor(this.options.jwtDecoderOptions)],
    });
    const func = factory.create();
    await func(app, container);
  }

  private async useAuthGuard(app: Express, container: Container) {
    const factory = new UseGuards({ guards: [new AuthenticationGuard()] });
    const func = factory.create();
    await func(app, container);
  }
}
