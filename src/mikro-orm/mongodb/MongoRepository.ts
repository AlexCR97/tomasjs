import { GetRepository } from "@mikro-orm/core";
import { MongoEntityRepository } from "@mikro-orm/mongodb";

export type MongoRepository<T extends object> = GetRepository<T, MongoEntityRepository<T>>;
