import { constructor } from "tsyringe/dist/typings/types";
import { DatabaseDriver } from "./DatabaseDriver";

export abstract class RepositoryNameFactory {
  private constructor() {}

  static create<T>(driver: DatabaseDriver, entityClass: constructor<T>) {
    return `${driver}${entityClass.name}Repository`;
  }
}
