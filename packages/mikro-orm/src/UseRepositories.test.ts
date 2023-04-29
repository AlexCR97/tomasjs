import "reflect-metadata";
import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { Entity, PrimaryKey } from "@mikro-orm/core";
import { MongoEntityRepository, ObjectId } from "@mikro-orm/mongodb";
import { Container, ServiceContainerBuilder, injectable } from "@tomasjs/core";
import { TomasLogger } from "@tomasjs/logging";
import { DisposeMikroOrm } from "./DisposeMikroOrm";
import { UseMikroOrm } from "./UseMikroOrm";
import { UseRepositories } from "./UseRepositories";
import { MikroOrmOptions } from "./MikroOrmOptions";
import { Repository, injectRepository } from "./mongodb";
import { repositoryToken } from "./repositoryToken";

describe("UseRepositories", () => {
  const connectionString = "mongodb://127.0.0.1:27017";
  const database = "tomasjs-tests-mikro-orm";
  const logger = new TomasLogger("UseRepositories", "error");
  let testContainer: Container;

  //@ts-ignore
  @Entity()
  class TestEntity {
    //@ts-ignore
    @PrimaryKey()
    _id!: ObjectId;
  }

  const mikroOrmOptions: MikroOrmOptions = {
    options: {
      clientUrl: connectionString,
      dbName: database,
      entities: [TestEntity],
      allowGlobalContext: true,
      type: "mongo",
    },
  };

  beforeEach(async () => {
    await tryDisposeMikroOrmAsync();
  });

  afterEach(async () => {
    await tryDisposeMikroOrmAsync();
  });

  it(`Can use ${UseRepositories.name} to register a repository in the DI container`, async () => {
    testContainer = await new ServiceContainerBuilder()
      .setup(
        new UseMikroOrm({
          logger,
          mikroOrmOptions,
        })
      )
      .setup(new UseRepositories("mongo", [TestEntity]))
      .buildContainerAsync();

    const repository = testContainer.get<Repository<TestEntity>>(
      repositoryToken("mongo", TestEntity)
    );

    expect(repository).toBeInstanceOf(MongoEntityRepository<TestEntity>);
  });

  it(`Can resolve a repository via DI`, async () => {
    //@ts-ignore: Fix decorators not working in test files
    @injectable()
    class TestClass {
      constructor(
        //@ts-ignore: Fix decorators not working in test files
        @injectRepository(TestEntity) readonly repository: Repository<TestEntity>
      ) {}
    }

    testContainer = await new ServiceContainerBuilder()
      .setup(
        new UseMikroOrm({
          logger,
          mikroOrmOptions,
        })
      )
      .setup(new UseRepositories("mongo", [TestEntity]))
      .addClass(TestClass)
      .buildContainerAsync();

    const testInstance = testContainer.get<TestClass>(TestClass);

    expect(testInstance.repository).toBeInstanceOf(MongoEntityRepository<TestEntity>);
  });

  it("Can use a repository to perform a CRUD", async () => {
    testContainer = await new ServiceContainerBuilder()
      .setup(
        new UseMikroOrm({
          logger,
          mikroOrmOptions,
        })
      )
      .setup(new UseRepositories("mongo", [TestEntity]))
      .buildContainerAsync();

    const repository = testContainer.get<Repository<TestEntity>>(
      repositoryToken("mongo", TestEntity)
    );

    const newDocument = new TestEntity();
    await repository.persistAndFlush(newDocument);
    expect(newDocument._id).toBeTruthy();

    const createdDocument = await repository.findOneOrFail({ _id: newDocument._id });
    expect(createdDocument).toBeTruthy();
    expect(createdDocument._id).toEqual(newDocument._id);
  });

  async function tryDisposeMikroOrmAsync() {
    if (!testContainer) {
      return;
    }

    const teardownFunction = new DisposeMikroOrm("mongo").create();
    await teardownFunction(testContainer);
  }
});
