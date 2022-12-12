import { AsyncContainerSetup, AsyncContainerSetupFactory } from "@/builder";
import { Configuration, Options } from "@mikro-orm/core";
import { MongoDriver } from "@mikro-orm/mongodb";
import { MongoInstance } from "./MongoInstance";
import { MongoOrm } from "./MongoOrm";

export class MongoSetupFactory extends AsyncContainerSetupFactory {
  constructor(
    private readonly options: Options<MongoDriver> | Configuration<MongoDriver>,
    private readonly connect?: boolean
  ) {
    super();
  }
  create(): AsyncContainerSetup {
    return async (container) => {
      await MongoInstance.init(this.options, this.connect);
      container.registerSingleton(MongoOrm);
    };
  }
}
