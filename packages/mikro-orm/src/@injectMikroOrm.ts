import { inject } from "@tomasjs/core";
import { DatabaseDriver } from "./DatabaseDriver";
import { mikroOrmToken } from "./mikroOrmToken";

export function injectMikroOrm(driver?: DatabaseDriver) {
  const token = mikroOrmToken(driver);
  return inject(token);
}
