import { ClassConstructor } from "@tomasjs/core";
import { DatabaseDriver } from "./DatabaseDriver";
import { TokenBuilder } from "./TokenBuilder";
import { mikroOrmTokenPrefix } from "./mikroOrmTokenPrefix";

export function repositoryToken<T>(driver: DatabaseDriver, entity: ClassConstructor<T>): string {
  return new TokenBuilder()
    .add(mikroOrmTokenPrefix)
    .add(driver)
    .add(`${entity.name}Repository`)
    .build();
}
