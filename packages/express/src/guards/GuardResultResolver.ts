import { Container, TomasError, isClassConstructor } from "@tomasjs/core";
import { isGuardInstance } from "./Guard";
import { GuardContext } from "./GuardContext";
import { isGuardFunction } from "./GuardFunction";
import { GuardResult } from "./GuardResult";
import { GuardType } from "./GuardType";
import { isGuardFactory } from "./GuardFactory";

export class GuardResultResolver {
  constructor(private readonly container: Container, private readonly guard: GuardType) {}

  async isAllowedAsync(context: GuardContext): Promise<GuardResult> {
    if (isGuardFunction(this.guard)) {
      return await this.guard(context);
    }

    if (isGuardInstance(this.guard)) {
      return await this.guard.isAllowed(context);
    }

    if (isClassConstructor(this.guard)) {
      const guardInstance = this.container.get(this.guard);
      return await guardInstance.isAllowed(context);
    }

    if (isGuardFactory(this.guard)) {
      const guardType = this.guard.create();
      return new GuardResultResolver(this.container, guardType).isAllowedAsync(context);
    }

    throw new TomasError("`Unknown guard type", { data: { guard: this.guard } });
  }
}
