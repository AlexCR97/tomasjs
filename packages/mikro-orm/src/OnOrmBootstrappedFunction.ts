import { IDatabaseDriver, MikroORM } from "@mikro-orm/core";

export type OnOrmBootstrappedFunction = <D extends IDatabaseDriver = IDatabaseDriver>(
  orm: MikroORM<D>
) => void | Promise<void>;
