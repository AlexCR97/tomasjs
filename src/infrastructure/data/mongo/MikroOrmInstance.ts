import {
    EntityName,
    EntityRepository,
    GetRepository,
    MikroORM,
} from "@mikro-orm/core";
import { MongoDriver } from "@mikro-orm/mongodb";
import { TsMorphMetadataProvider } from "@mikro-orm/reflection";

export class MikroOrmInstance {
    private static mikroOrm: MikroOrmInstance;

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

        this.mikroOrm = new MikroOrmInstance(orm);
    }

    static get instance() {
        if (!this.mikroOrm) {
            throw new Error(
                `The MongoDB class has not been initialized. Please call the ${this.initializeAsync.name} method first.`
            );
        }

        return this.mikroOrm;
    }

    private constructor(public readonly orm: MikroORM) {}

    // TODO Remove this method
    getRepository<
        T extends object,
        U extends EntityRepository<T> = EntityRepository<T>
    >(entityName: EntityName<T>): GetRepository<T, U> {
        return this.orm.em.getRepository(entityName);
    }
}
