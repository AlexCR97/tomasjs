import { ContainerSetup, ContainerSetupFactory } from "@/builder";
import { Configuration, IDatabaseDriver, MikroORM, Options } from "@mikro-orm/core";
import { MikroOrmInjectionTokenFactory } from "./MikroOrmInjectionTokenFactory";

export class MikroOrmSetup<
  D extends IDatabaseDriver = IDatabaseDriver
> extends ContainerSetupFactory {
  constructor(
    private readonly options: Options<D> | Configuration<D>,
    private readonly connect?: boolean
  ) {
    super();
  }
  create(): ContainerSetup {
    return async (container) => {
      const databaseType = (this.options as any).type; // TODO Is this the correct way to get the database type?
      const injectionToken = MikroOrmInjectionTokenFactory.create(databaseType);
      const orm = await MikroORM.init(this.options, this.connect);
      container.addInstance(orm, injectionToken);
    };
  }
}
