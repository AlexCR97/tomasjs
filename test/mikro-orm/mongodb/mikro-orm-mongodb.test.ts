import "reflect-metadata";
import { afterEach, beforeEach, describe, it } from "@jest/globals";
import { tryCloseServerAsync } from "../../utils/server";
import { tick } from "../../utils/time";
import { AppBuilder } from "../../../src/builder";
import { HttpContext, StatusCodes } from "../../../src/core";
import { Endpoint } from "../../../src/endpoints";
import { MongoInstance, MongoOrm, MongoSetupFactory } from "../../../src/mikro-orm/mongodb";
import { PlainTextResponse } from "../../../src/responses";
import { Entity, PrimaryKey, Property, SerializedPrimaryKey } from "@mikro-orm/core";
import { ObjectId } from "@mikro-orm/mongodb";
import { injectable } from "tsyringe";
import fetch from "node-fetch";

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
  const serverAddress = `http://localhost:${port}`;
  const serverTeardownOffsetMilliseconds = 50;
  let server: any; // TODO Set http.Server type

  const connectionString = "mongodb://127.0.0.1:27017";
  const database = "tomasjs-tests";

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

  it(`Can inject ${MongoOrm.name}`, async () => {
    // Arrange
    const successMessage = "MongoOrm works!";
    const resourcePath = "users";

    @injectable()
    class CreateUserEndpoint extends Endpoint {
      constructor(private readonly mongo: MongoOrm) {
        super();
        this.method("post").path(`/${resourcePath}`);
      }
      handle(context: HttpContext) {
        const message = this.mongo?.em !== undefined ? successMessage : ":(";
        return new PlainTextResponse(message);
      }
    }

    server = await new AppBuilder()
      .register(
        new MongoSetupFactory({
          clientUrl: connectionString,
          dbName: database,
          entities: [User],
        })
      )
      .useEndpoint(CreateUserEndpoint)
      .buildAsync(port);

    // Act
    const response = await fetch(`${serverAddress}/${resourcePath}`, {
      method: "post",
      body: "",
      headers: { "Content-Type": "text/plain" },
    });

    // Assert
    expect(response.status).toBe(StatusCodes.ok);
    expect(response.text()).resolves.toEqual(successMessage);
  });
});
