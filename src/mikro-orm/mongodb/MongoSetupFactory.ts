import { DeferredContainerSetup } from "@/builder/DeferredContainerSetup";
import { DeferredContainerSetupFactory } from "@/builder/DeferredContainerSetupFactory";
import { Configuration, Options } from "@mikro-orm/core";
import { MongoDriver } from "@mikro-orm/mongodb";
import { MongoInstance } from "./MongoInstance";
import { MongoOrm } from "./MongoOrm";

export class MongoSetupFactory extends DeferredContainerSetupFactory {
  constructor(
    private readonly options: Options<MongoDriver> | Configuration<MongoDriver>,
    private readonly connect?: boolean
  ) {
    super();
  }
  create(): DeferredContainerSetup {
    return async (container) => {
      await MongoInstance.init(this.options, this.connect);
      container.registerSingleton(MongoOrm);
    };
  }
}
