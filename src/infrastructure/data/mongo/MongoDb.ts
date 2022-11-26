import { EntityName, EntityRepository, GetRepository, MikroORM } from "@mikro-orm/core";
import { TsMorphMetadataProvider } from "@mikro-orm/reflection";

export class MongoDB {
  private static mongodb: MongoDB;

  static async initializeAsync(): Promise<void> {
    const orm = await MikroORM.init({
      type: "mongo",
      clientUrl: "connectionString",
      dbName: "db-name",
      metadataProvider: TsMorphMetadataProvider,
      allowGlobalContext: true,
      // entities: [RecordEntity, RelationEntity, DescriptorEntity, User, RoleDescriptor],
    });

    this.mongodb = new MongoDB(orm);
  }

  static get instance() {
    if (!this.mongodb) {
      throw new Error("The MongoDB class has not been initialized");
    }

    return this.mongodb;
  }

  private constructor(private readonly orm: MikroORM) {}

  getRepository<T extends object, U extends EntityRepository<T> = EntityRepository<T>>(
    entityName: EntityName<T>
  ): GetRepository<T, U> {
    return this.orm.em.getRepository(entityName);
  }
}
