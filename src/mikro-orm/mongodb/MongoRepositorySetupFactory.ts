import { ContainerSetup, ContainerSetupFactory } from "@/builder";
import { EntityClass } from "@mikro-orm/core/typings";
import { MongoInstance } from "./MongoInstance";
import { MongoRepository } from "./MongoRepository";
import { MongoRepositoryName } from "./MongoRepositoryName";

export class MongoRepositorySetupFactory<T extends object = object> extends ContainerSetupFactory {
  constructor(private readonly entityName: EntityClass<T>) {
    super();
  }
  create(): ContainerSetup {
    return (container) => {
      const { em } = MongoInstance.instance.orm;
      const repositoryName = MongoRepositoryName(this.entityName);
      const repository: MongoRepository<T> = em.getRepository(this.entityName);
      container.register(repositoryName, { useValue: repository });
    };
  }
}
