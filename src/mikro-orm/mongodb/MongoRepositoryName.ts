import { EntityClass } from "@mikro-orm/core";

export const MongoRepositoryName = <T extends object>(entityClass: EntityClass<T>): string => {
  return `${entityClass.name}Repository`;
};
