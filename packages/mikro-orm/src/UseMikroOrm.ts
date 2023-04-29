import { ContainerSetupFactory, ContainerSetupFunction } from "@tomasjs/core";
import { Logger } from "@tomasjs/logging";
import { Configuration, IDatabaseDriver, MikroORM, Options } from "@mikro-orm/core";
import { DatabaseDriver } from "./DatabaseDriver";
import { mikroOrmToken } from "./mikroOrmToken";
import { OnConnectedFunction } from "./OnConnectedFunction";
import { OnOrmBootstrappedFunction } from "./OnOrmBootstrappedFunction";

interface MikroOrmOptions<D extends IDatabaseDriver = IDatabaseDriver> {
  options: Options<D> | Configuration<D>;
  connect?: boolean;
}

export class UseMikroOrm<D extends IDatabaseDriver = IDatabaseDriver>
  implements ContainerSetupFactory
{
  constructor(
    private readonly config: {
      mikroOrmOptions: MikroOrmOptions<D>;
      logger?: Logger;
      onConnected?: OnConnectedFunction;
      onBootstrapped?: OnOrmBootstrappedFunction;
    }
  ) {}

  private get mikroOrmOptions() {
    return this.config.mikroOrmOptions;
  }

  private get databaseDriver(): DatabaseDriver {
    return (this.mikroOrmOptions.options as any).type; // TODO Is this the correct way to get the database driver?
  }

  private get logger() {
    return this.config.logger;
  }

  private get onConnected(): OnConnectedFunction | undefined {
    return this.config.onConnected;
  }

  private get onBootstrapped(): OnOrmBootstrappedFunction | undefined {
    return this.config.onBootstrapped;
  }

  create(): ContainerSetupFunction {
    return async (container) => {
      const orm = await this.establishConnectionAsync();
      const ormToken = mikroOrmToken(this.databaseDriver);
      container.addInstance(orm, ormToken);
      this.tryInvokeOnBootstrappedFunction(orm);
    };
  }

  private async establishConnectionAsync(): Promise<MikroORM<D>> {
    this.logger?.info(`Establishing connection to ${this.databaseDriver} ...`);
    const orm = await MikroORM.init(this.mikroOrmOptions.options, this.mikroOrmOptions.connect);
    this.logger?.info("`Connection established!");

    this.tryInvokeOnConnectedFunction();

    return orm;
  }

  private tryInvokeOnConnectedFunction() {
    if (!this.onConnected) {
      return;
    }

    this.onConnected();
  }

  private tryInvokeOnBootstrappedFunction(orm: MikroORM<D>) {
    if (!this.onBootstrapped) {
      return;
    }

    this.onBootstrapped(orm);
  }
}
