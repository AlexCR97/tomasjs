import { DefaultLogger } from "@/core/logger";
import { MikroORM } from "@mikro-orm/core";
import { MongoDriver } from "@mikro-orm/mongodb";
import { TsMorphMetadataProvider } from "@mikro-orm/reflection";

interface MikroOrmInstanceOptions {
  connectionString: string;
  database: string;
  entities: string[];
  entitiesTs: string[];
}

export class MikroOrmInstance {
  private static mikroOrm: MikroOrmInstance;

  static async initializeAsync(options: MikroOrmInstanceOptions): Promise<void> {
    const logger = new DefaultLogger(MikroOrmInstance.name, { level: "info" });
    logger.debug(`Initializing ${MikroOrmInstance.name}...`);

    const orm = await MikroORM.init<MongoDriver>({
      entities: options.entities,
      entitiesTs: options.entitiesTs,
      dbName: options.database,
      clientUrl: options.connectionString,
      type: "mongo",
      metadataProvider: TsMorphMetadataProvider,
      allowGlobalContext: true,
    });

    this.mikroOrm = new MikroOrmInstance(orm);

    logger.debug(`Successfully Initialized ${MikroOrmInstance.name}!`);
  }

  static get instance() {
    if (!this.mikroOrm) {
      throw new Error(
        `The ${MikroOrmInstance.name} singleton has not been initialized. Please call the ${this.initializeAsync.name} method first.`
      );
    }

    return this.mikroOrm;
  }

  private constructor(public readonly orm: MikroORM) {}
}
