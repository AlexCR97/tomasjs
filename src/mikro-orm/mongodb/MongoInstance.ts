import { Configuration, Options } from "@mikro-orm/core";
import { MikroORM, MongoDriver } from "@mikro-orm/mongodb";

export class MongoInstance {
  private static _instance?: MongoInstance;

  static async init(
    options: Options<MongoDriver> | Configuration<MongoDriver>,
    connect?: boolean
  ): Promise<MikroORM> {
    const orm = await MikroORM.init(
      {
        ...options,
        type: "mongo",
      },
      connect
    );
    this._instance = new MongoInstance(orm);
    return orm;
  }

  static async dispose(force?: boolean) {
    if (this._instance === undefined || this._instance === null) {
      return;
    }

    await this._instance.orm.close(force);
    this._instance = undefined;
  }

  static get instance() {
    if (!this._instance) {
      throw new Error(
        `The ${MongoInstance.name} singleton has not been initialized. Please call the ${this.init.name} method first.`
      );
    }

    return this._instance;
  }

  static get isInitialized(): boolean {
    return this._instance !== undefined;
  }

  private constructor(public readonly orm: MikroORM) {}
}
