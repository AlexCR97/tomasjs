// import { DescriptorEntity } from "@/core/entities/base/DescriptorEntity";
// import { RecordEntity } from "@/core/entities/base/RecordEntity";
// import { RelationEntity } from "@/core/entities/base/RelationEntity";
// import { RoleDescriptor } from "@/core/entities/RoleDescriptor";
// import { User } from "@/core/entities/User";
import { EntityName, EntityRepository, GetRepository, MikroORM } from "@mikro-orm/core";
import { MongoDriver } from "@mikro-orm/mongodb";
import { TsMorphMetadataProvider } from "@mikro-orm/reflection";

export class MongoDB {
  private static mongodb: MongoDB;
  // private static baseEntities = [RecordEntity, RelationEntity, DescriptorEntity];

  static async initializeAsync(): Promise<void> {
    const orm = await MikroORM.init<MongoDriver>({
      // entities: [
      //   // The order of entities matter! More into at https://mikro-orm.io/docs/installation#possible-issues-with-circular-dependencies
      //   ...this.baseEntities,
      //   RoleDescriptor,
      //   User,
      // ],
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
