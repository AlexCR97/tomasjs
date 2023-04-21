import { ClassConstructor } from "@tomasjs/core";
import { DatabaseDriver } from "./DatabaseDriver";

export abstract class RepositoryNameFactory {
  private constructor() {}

  static create<T>(driver: DatabaseDriver, entityClass: ClassConstructor<T>) {
    return `${driver}${entityClass.name}Repository`;
  }
}
