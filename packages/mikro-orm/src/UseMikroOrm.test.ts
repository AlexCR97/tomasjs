import "reflect-metadata";
import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { Entity, MikroORM, PrimaryKey } from "@mikro-orm/core";
import { ObjectId } from "@mikro-orm/mongodb";
import { Container, ServiceContainerBuilder, injectable } from "@tomasjs/core";
import { TomasLogger } from "@tomasjs/logging";
import { injectMikroOrm } from "./@injectMikroOrm";
import { DisposeMikroOrm } from "./DisposeMikroOrm";
import { mikroOrmToken } from "./mikroOrmToken";
import { UseMikroOrm } from "./UseMikroOrm";

describe("UseMikroOrm", () => {
  const connectionString = "mongodb://127.0.0.1:27017";
  const database = "tomasjs-tests-mikro-orm";
  const logger = new TomasLogger("UseMikroOrm", "error");
  let testContainer: Container;

  beforeEach(async () => {
    await tryDisposeMikroOrmAsync();
  });

  afterEach(async () => {
    await tryDisposeMikroOrmAsync();
  });

  //@ts-ignore
  @Entity()
  class TestEntity {
    //@ts-ignore
    @PrimaryKey()
    _id!: ObjectId;
  }

  it(`Can use ${UseMikroOrm.name} to connect to MongoDB`, (done) => {
    new ServiceContainerBuilder()
      .setup(
        new UseMikroOrm({
          logger,
          mikroOrmOptions: {
            options: {
              clientUrl: connectionString,
              dbName: database,
              entities: [TestEntity],
              allowGlobalContext: true,
              type: "mongo",
            },
          },
          onConnected() {
            done(); // The test will succeed when the connection is established
          },
        })
      )
      .buildContainerAsync()
      .then((container) => {
        testContainer = container;
      });
  });

  it(`Can use ${UseMikroOrm.name} to bootstrap a MikroORM instance`, (done) => {
    new ServiceContainerBuilder()
      .setup(
        new UseMikroOrm({
          logger,
          mikroOrmOptions: {
            options: {
              clientUrl: connectionString,
              dbName: database,
              entities: [TestEntity],
              allowGlobalContext: true,
              type: "mongo",
            },
          },
          onBootstrapped(orm) {
            expect(orm).toBeInstanceOf(MikroORM);
            done(); // The test will succeed when the orm is bootstrapped successfully
          },
        })
      )
      .buildContainerAsync()
      .then((container) => {
        testContainer = container;
      });
  });

  it(`Can resolve the MikroORM instance via the ServiceProvider`, async () => {
    testContainer = await new ServiceContainerBuilder()
      .setup(
        new UseMikroOrm({
          logger,
          mikroOrmOptions: {
            options: {
              clientUrl: connectionString,
              dbName: database,
              entities: [TestEntity],
              allowGlobalContext: true,
              type: "mongo",
            },
          },
        })
      )
      .buildContainerAsync();

    const orm = testContainer.get<MikroORM>(mikroOrmToken("mongo"));
    expect(orm).toBeInstanceOf(MikroORM);
  });

  it(`Can resolve the MikroORM instance via DI`, async () => {
    //@ts-ignore: Fix decorators not working in test files
    @injectable()
    class TestClass {
      constructor(
        //@ts-ignore: Fix decorators not working in test files
        @injectMikroOrm("mongo") readonly orm: MikroORM
      ) {}
    }

    testContainer = await new ServiceContainerBuilder()
      .addClass(TestClass)
      .setup(
        new UseMikroOrm({
          logger,
          mikroOrmOptions: {
            options: {
              clientUrl: connectionString,
              dbName: database,
              entities: [TestEntity],
              allowGlobalContext: true,
              type: "mongo",
            },
          },
        })
      )
      .buildContainerAsync();

    const testInstance = testContainer.get<TestClass>(TestClass);
    const orm = testInstance.orm;
    expect(orm).toBeInstanceOf(MikroORM);
  });

  async function tryDisposeMikroOrmAsync() {
    if (!testContainer) {
      return;
    }

    const teardownFunction = new DisposeMikroOrm("mongo").create();
    await teardownFunction(testContainer);
  }
});
