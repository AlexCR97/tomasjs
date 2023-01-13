import { inject } from "@/container";
import { DatabaseDriver } from "./DatabaseDriver";
import { MikroOrmInjectionTokenFactory } from "./MikroOrmInjectionTokenFactory";

export function inMikroOrm(driver?: DatabaseDriver) {
  const token = MikroOrmInjectionTokenFactory.create(driver);
  return inject(token);
}
