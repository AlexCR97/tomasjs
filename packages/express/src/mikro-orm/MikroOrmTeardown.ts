import { ContainerTeardown, ContainerTeardownFactory } from "@/builder";
import { DatabaseDriver } from "./DatabaseDriver";
import { MikroOrmInjectionTokenFactory } from "./MikroOrmInjectionTokenFactory";

export class MikroOrmTeardown implements ContainerTeardownFactory {
  constructor(private readonly driver: DatabaseDriver) {}

  create(): ContainerTeardown {
    return async (container) => {
      // TODO Figure out how to correctly dispose MikroORM
      const injectionToken = MikroOrmInjectionTokenFactory.create(this.driver);
      container.remove(injectionToken);
    };
  }
}
