import { ContainerSetup, ContainerSetupFactory } from "@/builder";
import { constructor } from "tsyringe/dist/typings/types";
import { DatabaseDriver } from "./DatabaseDriver";
import { MikroOrmResolver } from "./MikroOrmResolver";
import { RepositoryNameFactory } from "./RepositoryNameFactory";

export class RepositorySetup<TEntity extends object> extends ContainerSetupFactory {
  constructor(
    private readonly driver: DatabaseDriver,
    private readonly entityClass: constructor<TEntity>
  ) {
    super();
  }
  create(): ContainerSetup {
    return (container) => {
      const orm = MikroOrmResolver.resolve(this.driver);
      const repositoryName = RepositoryNameFactory.create<TEntity>(this.driver, this.entityClass);
      const repository = orm.em.getRepository<TEntity>(this.entityClass);
      container.register(repositoryName, { useValue: repository });
    };
  }
}
