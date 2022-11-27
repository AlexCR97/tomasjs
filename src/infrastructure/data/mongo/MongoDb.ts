import { EntityName, EntityRepository, GetRepository, MikroORM } from "@mikro-orm/core";
import { MongoDriver } from "@mikro-orm/mongodb";
import { TsMorphMetadataProvider } from "@mikro-orm/reflection";

export class MongoDB {
  private static mongodb: MongoDB;

  static async initializeAsync(): Promise<void> {
    const orm = await MikroORM.init<MongoDriver>({
      entities: ["./dist/core/entities/base", "./dist/core/entities"],
      entitiesTs: ["./src/core/entities/base", "./src/core/entities"],
      dbName: "ts-dependency-injection",
      clientUrl: "mongodb://127.0.0.1:27017",
      type: "mongo",
      metadataProvider: TsMorphMetadataProvider,
      allowGlobalContext: true,
    });

    this.mongodb = new MongoDB(orm);
  }

  static get instance() {
    if (!this.mongodb) {
      throw new Error(
        "The MongoDB class has not been initialized. Please call the initializeAsync method first."
      );
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
