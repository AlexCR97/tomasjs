import { AsyncContainerSetup, AsyncContainerSetupFactory } from "@/builder";
import { EntityClass } from "@mikro-orm/core/typings";
import { MongoInstance } from "./MongoInstance";
import { MongoRepository } from "./MongoRepository";
import { MongoRepositoryName } from "./MongoRepositoryName";

export class MongoRepositorySetupFactory<
  T extends object = object
> extends AsyncContainerSetupFactory {
  constructor(private readonly entityName: EntityClass<T>) {
    super();
  }
  create(): AsyncContainerSetup {
    return async (container) => {
      const repository: MongoRepository<T> = MongoInstance.instance.orm.em.getRepository(
        this.entityName
      );
      container.register(MongoRepositoryName(this.entityName), { useValue: repository });
    };
  }
}
