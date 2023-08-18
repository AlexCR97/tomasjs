import { MikroORM } from "@mikro-orm/core";
import { DatabaseDriver } from "./DatabaseDriver";
import { mikroOrmTokenPrefix } from "./mikroOrmTokenPrefix";
import { TokenBuilder } from "./TokenBuilder";

export function mikroOrmToken(driver?: DatabaseDriver): string {
  return new TokenBuilder()
    .add(mikroOrmTokenPrefix)
    .addIfNotEmpty(driver)
    .add(MikroORM.name)
    .build();
}
