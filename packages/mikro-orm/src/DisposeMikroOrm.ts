import { ContainerTeardownFactory, ContainerTeardownFunction } from "@tomasjs/core";
import { DatabaseDriver } from "./DatabaseDriver";
import { mikroOrmToken } from "./mikroOrmToken";
import { MikroORM } from "@mikro-orm/core";

export class DisposeMikroOrm implements ContainerTeardownFactory {
  constructor(private readonly driver: DatabaseDriver) {}

  create(): ContainerTeardownFunction {
    return async (container) => {
      const token = mikroOrmToken(this.driver);
      const orm = container.getOrDefault<MikroORM>(token);

      if (!orm) {
        return;
      }

      if (!(await orm.isConnected())) {
        return;
      }

      await orm.close(true);
      container.remove(token);

      // TODO Remove repositories too
    };
  }
}
