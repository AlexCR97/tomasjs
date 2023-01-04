import "reflect-metadata";
import { afterEach, beforeEach, describe, it } from "@jest/globals";
import { tryCloseServerAsync } from "../../utils/server";
import { tick } from "../../utils/time";
import { TomasAppBuilder, ContainerBuilder } from "../../../src/builder";
import { internalContainer } from "../../../src/container";
import { HttpContext, StatusCodes } from "../../../src/core";
import { endpoint, Endpoint, path } from "../../../src/endpoints";
import {
  MikroOrmResolver,
  MikroOrmSetup,
  RepositorySetup,
  inMikroOrm,
  MikroOrmTeardown,
} from "../../../src/mikro-orm";
import { inRepository, Repository } from "../../../src/mikro-orm/mongodb";
import { PlainTextResponse } from "../../../src/responses";
import {
  Entity,
  EntityName,
  PrimaryKey,
  Property,
  SerializedPrimaryKey,
  MikroORM,
} from "@mikro-orm/core";
import { ObjectId } from "@mikro-orm/mongodb";
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

describe("mikro-orm", () => {
  const port = 3035;
  const serverAddress = `http://localhost:${port}`;
  const serverTeardownOffsetMilliseconds = 0;
  let server: any; // TODO Set http.Server type

  const connectionString = "mongodb://127.0.0.1:27017";
  const database = "tomasjs-tests";

  beforeEach(async () => {
    await tick(serverTeardownOffsetMilliseconds);
    await clearCollectionAsync(User);
    await tryCloseServerAsync(server);
  });

  afterEach(async () => {
    await tick(serverTeardownOffsetMilliseconds);
    await clearCollectionAsync(User);

    // TODO Move this to an API
    // This is only necessary after the tests
    const teardownFunction = new MikroOrmTeardown("mongo").create();
    await teardownFunction(internalContainer);

    await tryCloseServerAsync(server);
  });

  it(`Can connect via ${MikroOrmSetup.name}`, async () => {
    // Arrange
    await new ContainerBuilder()
      .setup(
        new MikroOrmSetup({
          clientUrl: connectionString,
          dbName: database,
          entities: [User],
          allowGlobalContext: true,
          type: "mongo",
        })
      )
      .buildAsync();

    server = await new TomasAppBuilder().buildAsync(port);
  });

  it(`Can inject ${MikroORM.name}`, async () => {
    // Arrange
    const successMessage = "MikroORM works!";
    const resourcePath = "users";

    @endpoint("post")
    @path(resourcePath)
    class CreateUserEndpoint implements Endpoint {
      constructor(@inMikroOrm("mongo") private readonly orm: MikroORM) {}
      handle(context: HttpContext) {
        const message = this.orm?.em !== undefined ? successMessage : ":(";
        return new PlainTextResponse(message);
      }
    }

    await new ContainerBuilder()
      .setup(
        new MikroOrmSetup({
          clientUrl: connectionString,
          dbName: database,
          entities: [User],
          allowGlobalContext: true,
          type: "mongo",
        })
      )
      .buildAsync();

    server = await new TomasAppBuilder().useEndpoint(CreateUserEndpoint).buildAsync(port);

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

  it(`Can use ${MikroORM.name} to create a document`, async () => {
    // Arrange
    const resourcePath = "users";

    @endpoint("post")
    @path(resourcePath)
    class CreateUserEndpoint implements Endpoint {
      constructor(@inMikroOrm("mongo") private readonly orm: MikroORM) {}

      async handle(context: HttpContext) {
        const usersRepository = this.orm.em.getRepository(User);
        const createdUserId = await usersRepository.nativeInsert({
          email: context.request.body.email,
          password: context.request.body.password,
        });
        return new PlainTextResponse(createdUserId.toString());
      }
    }

    await new ContainerBuilder()
      .setup(
        new MikroOrmSetup({
          clientUrl: connectionString,
          dbName: database,
          entities: [User],
          allowGlobalContext: true,
          type: "mongo",
        })
      )
      .buildAsync();

    server = await new TomasAppBuilder().useJson().useEndpoint(CreateUserEndpoint).buildAsync(port);

    // Act
    const response = await fetch(`${serverAddress}/${resourcePath}`, {
      method: "post",
      body: JSON.stringify({
        email: "sample@domain.com",
        password: "123456",
      }),
      headers: { "Content-Type": "text/plain" },
    });

    // Assert
    expect(response.status).toBe(StatusCodes.ok);

    const createdUserId = await response.text();
    expect(ObjectId.isValid(createdUserId)).toBeTruthy();
  });

  it(`Can inject a Repository to create a document`, async () => {
    // Arrange
    const resourcePath = "users";

    @endpoint("post")
    @path(resourcePath)
    class CreateUserEndpoint implements Endpoint {
      constructor(@inRepository(User) private readonly usersRepository: Repository<User>) {}
      async handle(context: HttpContext) {
        const createdUserId = await this.usersRepository.nativeInsert({
          email: context.request.body.email,
          password: context.request.body.password,
        });
        return new PlainTextResponse(createdUserId.toString());
      }
    }

    await new ContainerBuilder()
      .setup(
        new MikroOrmSetup({
          clientUrl: connectionString,
          dbName: database,
          entities: [User],
          allowGlobalContext: true,
          type: "mongo",
        })
      )
      .setup(new RepositorySetup("mongo", User))
      .buildAsync();

    server = await new TomasAppBuilder().useJson().useEndpoint(CreateUserEndpoint).buildAsync(port);

    // Act
    const response = await fetch(`${serverAddress}/${resourcePath}`, {
      method: "post",
      body: JSON.stringify({
        email: "sample@domain.com",
        password: "123456",
      }),
      headers: { "Content-Type": "text/plain" },
    });

    // Assert
    expect(response.status).toBe(StatusCodes.ok);

    const createdUserId = await response.text();
    expect(ObjectId.isValid(createdUserId)).toBeTruthy();
  });
});

async function clearCollectionAsync<T extends object>(entityName: EntityName<T>) {
  const orm = MikroOrmResolver.resolveOrDefault("mongo");

  if (orm === undefined) {
    return;
  }

  const repo = orm.em.getRepository(entityName);

  const entities = await repo.findAll();

  for (const entity of entities) {
    repo.remove(entity);
  }

  await repo.flush();
}
