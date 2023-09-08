import { AppSetupFactory, AppSetupFunction } from "@/builder";
import { UseGuards } from "@/guards";
import { AuthorizationGuard } from "./AuthorizationGuard";
import { IdentityClaim } from "..";

export class UseAuthorization implements AppSetupFactory {
  constructor(private readonly claims: IdentityClaim[]) {}

  create(): AppSetupFunction {
    return async (app, container) => {
      const appSetupFactory = new UseGuards({
        guards: [new AuthorizationGuard(this.claims)],
      });
      const appSetupFunction = appSetupFactory.create();
      await appSetupFunction(app, container);
    };
  }
}
