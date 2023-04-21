import { ContainerSetup, ContainerSetupFactory } from "@tomasjs/core";
import { Logger } from "@tomasjs/logging";
import { Configuration, IDatabaseDriver, MikroORM, Options } from "@mikro-orm/core";
import { MikroOrmInjectionTokenFactory } from "./MikroOrmInjectionTokenFactory";

export class MikroOrmSetup<
  D extends IDatabaseDriver = IDatabaseDriver
> extends ContainerSetupFactory {
  constructor(
    private readonly config: {
      options: Options<D> | Configuration<D>;
      connect?: boolean;
      logger?: Logger;
    }
  ) {
    super();
  }

  private get options() {
    return this.config.options;
  }

  private get connect() {
    return this.config.connect;
  }

  private get logger() {
    return this.config.logger;
  }

  create(): ContainerSetup {
    return async (container) => {
      const databaseType = (this.options as any).type; // TODO Is this the correct way to get the database type?
      const injectionToken = MikroOrmInjectionTokenFactory.create(databaseType);
      this.logger?.info(`Establishing ${databaseType} connection ...`);
      const orm = await MikroORM.init(this.options, this.connect);
      this.logger?.info("`Connection established!");
      container.addInstance(orm, injectionToken);
    };
  }
}
