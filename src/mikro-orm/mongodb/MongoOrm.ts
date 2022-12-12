import { singleton } from "tsyringe";
import { MongoInstance } from "./MongoInstance";

@singleton()
export class MongoOrm {
  get em() {
    return MongoInstance.instance.orm.em;
  }
}
