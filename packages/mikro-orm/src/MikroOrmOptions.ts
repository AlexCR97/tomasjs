import { Configuration, IDatabaseDriver, Options } from "@mikro-orm/core";

export interface MikroOrmOptions<D extends IDatabaseDriver = IDatabaseDriver> {
  options: Options<D> | Configuration<D>;
  connect?: boolean;
}
