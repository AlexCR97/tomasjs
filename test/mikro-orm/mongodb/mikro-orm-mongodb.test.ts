import "reflect-metadata";
import { afterEach, beforeEach, describe, it } from "@jest/globals";
import { tryCloseServerAsync } from "../../utils/server";
import { tick } from "../../utils/time";
import { AppBuilder } from "../../../src/builder";
import { MongoInstance, MongoSetupFactory } from "../../../src/mikro-orm/mongodb";

import { Entity, PrimaryKey, Property, SerializedPrimaryKey } from "@mikro-orm/core";
import { ObjectId } from "@mikro-orm/mongodb";

@Entity()
class User {
  @PrimaryKey()
  _id!: ObjectId;

  @SerializedPrimaryKey()
  id!: string;

  @Property()
  email!: string;

  @Property()
  password!: string;
}

describe("MikroORM - MongoDB", () => {
  const port = 3035;
  // const serverAddress = `http://localhost:${port}`;
  const serverTeardownOffsetMilliseconds = 50;
  let server: any; // TODO Set http.Server type

  beforeEach(async () => {
    await tick(serverTeardownOffsetMilliseconds);
    await MongoInstance.dispose(true);
    await tryCloseServerAsync(server);
  });

  afterEach(async () => {
    await tick(serverTeardownOffsetMilliseconds);
    await MongoInstance.dispose(true);
    await tryCloseServerAsync(server);
  });

  it(`Can connect via ${MongoSetupFactory.name}`, async () => {
    // Arrange
    const connectionString = "mongodb://127.0.0.1:27017";
    const database = "tomasjs-tests";

    server = await new AppBuilder()
      .register(
        new MongoSetupFactory({
          clientUrl: connectionString,
          dbName: database,
          entities: [User],
        })
      )
      .buildAsync(port);
  });
});
