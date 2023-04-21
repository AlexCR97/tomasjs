import { globalContainer } from "@tomasjs/core";
import { MikroORM } from "@mikro-orm/core";
import { DatabaseDriver } from "./DatabaseDriver";
import { MikroOrmInjectionTokenFactory } from "./MikroOrmInjectionTokenFactory";

export abstract class MikroOrmResolver {
  static resolve(driver: DatabaseDriver): MikroORM {
    const token = MikroOrmInjectionTokenFactory.create(driver);
    return globalContainer.get(token);
  }

  static resolveOrDefault(driver: DatabaseDriver): MikroORM | undefined {
    try {
      return this.resolve(driver);
    } catch {
      return undefined;
    }
  }
}
