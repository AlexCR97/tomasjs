import { AppSetupFactory, AppSetupFunction } from "@/builder";
import { UseGuards } from "@/guards";
import { AuthenticationGuard } from "./AuthenticationGuard";
import { UseInterceptors } from "@/interceptors";
import { Container } from "@tomasjs/core";
import { Express } from "express";
import { JwtDecoderOptions } from "./jwt";
import { authenticationInterceptorStrategy } from "./authenticationInterceptorStrategy";

export interface UseAuthenticationOptions {
  authenticationScheme: "jwt";
  jwtDecoderOptions?: JwtDecoderOptions;
}

export class UseAuthentication implements AppSetupFactory {
  constructor(private readonly options: UseAuthenticationOptions) {}

  create(): AppSetupFunction {
    return async (app, container) => {
      await this.useAuthSchemeInterceptor(app, container);
      await this.useAuthGuard(app, container);
    };
  }

  private async useAuthSchemeInterceptor(app: Express, container: Container) {
    const authenticationInterceptor = authenticationInterceptorStrategy(this.options);
    const factory = new UseInterceptors({
      interceptors: [authenticationInterceptor],
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
