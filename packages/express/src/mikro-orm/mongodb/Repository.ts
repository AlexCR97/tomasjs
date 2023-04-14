import { GetRepository } from "@mikro-orm/core";
import { MongoEntityRepository } from "@mikro-orm/mongodb";

export type Repository<T extends object> = GetRepository<T, MongoEntityRepository<T>>;
