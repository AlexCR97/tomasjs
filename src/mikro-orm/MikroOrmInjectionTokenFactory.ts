import { MikroORM } from "@mikro-orm/core";
import { DatabaseDriver } from "./DatabaseDriver";

export abstract class MikroOrmInjectionTokenFactory {
  private constructor() {}

  static create(driver?: DatabaseDriver): string {
    return driver === undefined || driver === null || driver.trim().length === 0
      ? MikroORM.name
      : `${driver}${MikroORM.name}`;
  }
}
