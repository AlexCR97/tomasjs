import { MikroORM } from "@mikro-orm/mongodb";
import {
  ClassConstructor,
  Container,
  ContainerSetupFactory,
  ContainerSetupFunction,
} from "@tomasjs/core";
import { DatabaseDriver } from "./DatabaseDriver";
import { mikroOrmToken } from "./mikroOrmToken";
import { repositoryToken } from "./repositoryToken";

export class UseRepositories implements ContainerSetupFactory {
  constructor(
    private readonly driver: DatabaseDriver,
    private readonly entities: ClassConstructor<any>[]
  ) {}

  create(): ContainerSetupFunction {
    return (container) => {
      const orm = this.resolveMikroOrmInstance(container);

      for (const entity of this.entities) {
        this.registerRepository(container, orm, entity);
      }
    };
  }

  private resolveMikroOrmInstance(container: Container) {
    const token = mikroOrmToken(this.driver);
    return container.get<MikroORM>(token);
  }

  private registerRepository(container: Container, orm: MikroORM, entity: ClassConstructor<any>) {
    const repositoryName = repositoryToken(this.driver, entity);
    const repository = orm.em.getRepository(entity);
    container.addInstance(repository, repositoryName);
  }
}
