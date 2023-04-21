import { ClassConstructor, ContainerSetup, ContainerSetupFactory } from "@tomasjs/core";
import { DatabaseDriver } from "./DatabaseDriver";
import { MikroOrmResolver } from "./MikroOrmResolver";
import { RepositoryNameFactory } from "./RepositoryNameFactory";

export class RepositorySetup<TEntity extends object> extends ContainerSetupFactory {
  constructor(
    private readonly driver: DatabaseDriver,
    private readonly entityClass: ClassConstructor<TEntity>
  ) {
    super();
  }
  create(): ContainerSetup {
    return (container) => {
      const orm = MikroOrmResolver.resolve(this.driver);
      const repositoryName = RepositoryNameFactory.create<TEntity>(this.driver, this.entityClass);
      const repository = orm.em.getRepository<TEntity>(this.entityClass);
      container.addInstance(repository, repositoryName);
    };
  }
}
