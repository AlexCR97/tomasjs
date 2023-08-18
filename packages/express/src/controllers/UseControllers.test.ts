import "reflect-metadata";
import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { bootstrapLoggerFactory } from "@tomasjs/logging";
import axios from "axios";
import fetch from "node-fetch";
import { Server } from "http";
import { controller } from "./@controller";
import { httpGet, httpPost } from "./@http";
import { UseControllers } from "./UseControllers";
import { ExpressAppBuilder } from "../builder";
import { statusCodes } from "../core";
import { OkResponse } from "../responses/status-codes";
import { Guard, GuardContext, GuardResult, guard } from "../guards";
import { ServiceContainerBuilder, inject } from "@tomasjs/core";
import {
  CommandDispatcher,
  CommandHandler,
  QueryDispatcher,
  QueryHandler,
  UseCommands,
  UseQueries,
  commandHandler,
  queryHandler,
} from "@tomasjs/cqrs";
import { UseMikroOrm, UseRepositories } from "@tomasjs/mikro-orm";
import { Repository, injectRepository } from "@tomasjs/mikro-orm/mongodb";
import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { ObjectId } from "@mikro-orm/mongodb";

describe("controllers-UseControllers", () => {
  let server: Server | undefined;
  const port = 3002;
  const serverAddress = `http://localhost:${port}`;
  const logger = bootstrapLoggerFactory("error");

  beforeEach(async () => {
    await disposeAsync();
  });

  afterEach(async () => {
    await disposeAsync();
  });

  it("Can bootstrap a Controller", async () => {
    @controller("test")
    class TestController {
      @httpGet()
      get() {
        return new OkResponse();
      }
    }

    server = await new ExpressAppBuilder({ port, logger })
      .use(
        new UseControllers({
          controllers: [TestController],
          logger,
        })
      )
      .buildAsync();

    const response = await axios.get(`${serverAddress}/test`);

    expect(response.status).toBe(statusCodes.ok);
  });

  it("Can receive json data from a Controller", async () => {
    interface User {
      email: string;
      password: string;
    }

    const expectedFetchedUser: User = {
      email: "example@domain.com",
      password: "123456",
    };

    @controller("users")
    class UsersController {
      @httpGet("paged")
      find(): User[] {
        return [expectedFetchedUser];
      }
    }

    server = await new ExpressAppBuilder({ port, logger })
      .use(new UseControllers({ controllers: [UsersController], logger }))
      .buildAsync();

    // Act/Assert
    const response = await fetch(`${serverAddress}/users/paged`);
    expect(response.status).toBe(statusCodes.ok);

    const responseJson = await response.json();
    const responseUser = responseJson[0];
    expect(responseUser).toEqual(expectedFetchedUser);
  });

  it("Can use controller-level guards", async () => {
    const collectedData: string[] = [];
    const dataFromGuard = "Data from TestGuard";
    const dataFromFirstController = "Data from FirstController";
    const dataFromSecondController = "Data from SecondController";

    @guard()
    class TestGuard implements Guard {
      isAllowed(context: GuardContext) {
        collectedData.push(dataFromGuard);
        return true;
      }
    }

    @controller("first", { guards: [TestGuard] })
    class FirstController {
      @httpGet()
      get() {
        collectedData.push(dataFromFirstController);
        return new OkResponse();
      }
    }

    @controller("second")
    class SecondController {
      @httpGet()
      get() {
        collectedData.push(dataFromSecondController);
        return new OkResponse();
      }
    }

    const container = await new ServiceContainerBuilder().addClass(TestGuard).buildContainerAsync();

    server = await new ExpressAppBuilder({ port, logger, container })
      .use(
        new UseControllers({
          controllers: [FirstController, SecondController],
          logger,
        })
      )
      .buildAsync();

    const secondResponse = await fetch(`${serverAddress}/second`);
    expect(secondResponse.status).toBe(statusCodes.ok);

    const firstResponse = await fetch(`${serverAddress}/first`);
    expect(firstResponse.status).toBe(statusCodes.ok);

    expect(collectedData.length).toBe(3);
    expect(collectedData[0]).toBe(dataFromSecondController);
    expect(collectedData[1]).toBe(dataFromGuard);
    expect(collectedData[2]).toBe(dataFromFirstController);
  });

  it("Can use method-level guards", async () => {
    const collectedData: string[] = [];
    const dataFromControllerGuard = "Data from ControllerGuard";
    const dataFromMethodGuard = "Data from MethodGuard";
    const dataFromFirstController = "Data from FirstController";
    const dataFromSecondController = "Data from SecondController";

    @guard()
    class ControllerGuard implements Guard {
      isAllowed(context: GuardContext) {
        collectedData.push(dataFromControllerGuard);
        return true;
      }
    }

    @guard()
    class MethodGuard implements Guard {
      isAllowed(context: GuardContext): GuardResult {
        collectedData.push(dataFromMethodGuard);
        return true;
      }
    }

    @controller("first", { guards: [ControllerGuard] })
    class FirstController {
      @httpGet("/", { guards: [MethodGuard] })
      get() {
        collectedData.push(dataFromFirstController);
        return new OkResponse();
      }
    }

    @controller("second")
    class SecondController {
      @httpGet("/", { guards: [MethodGuard] })
      get() {
        collectedData.push(dataFromSecondController);
        return new OkResponse();
      }
    }

    const container = await new ServiceContainerBuilder()
      .addClass(ControllerGuard)
      .addClass(MethodGuard)
      .buildContainerAsync();

    server = await new ExpressAppBuilder({ port, logger, container })
      .use(
        new UseControllers({
          controllers: [FirstController, SecondController],
          logger,
        })
      )
      .buildAsync();

    const secondResponse = await fetch(`${serverAddress}/second`);
    expect(secondResponse.status).toBe(statusCodes.ok);

    const firstResponse = await fetch(`${serverAddress}/first`);
    expect(firstResponse.status).toBe(statusCodes.ok);

    expect(collectedData.length).toBe(5);
    expect(collectedData[0]).toBe(dataFromMethodGuard);
    expect(collectedData[1]).toBe(dataFromSecondController);
    expect(collectedData[2]).toBe(dataFromControllerGuard);
    expect(collectedData[3]).toBe(dataFromMethodGuard);
    expect(collectedData[4]).toBe(dataFromFirstController);
  });

  it("Can use with CQRS", async () => {
    const collectedData: string[] = [];
    const dataFromController = "Data from Controller";
    const dataFromCommand = "Data from Command";
    const dataFromQuery = "Data from Query";

    class TestCommand {}

    class TestQuery {}

    @commandHandler(TestCommand)
    class TestCommandHandler implements CommandHandler<TestQuery> {
      execute(command: TestQuery): void {
        collectedData.push(dataFromCommand);
      }
    }

    @queryHandler(TestQuery)
    class TestQueryHandler implements QueryHandler<TestQuery, void> {
      fetch(query: TestQuery): void {
        collectedData.push(dataFromQuery);
      }
    }

    @controller("test")
    class TestController {
      constructor(
        @inject(CommandDispatcher) private readonly commands: CommandDispatcher,
        @inject(QueryDispatcher) private readonly queries: QueryDispatcher
      ) {}

      @httpGet()
      async get() {
        collectedData.push(dataFromController);
        await this.commands.execute(new TestCommand());
        await this.queries.fetch(new TestQuery());
        return new OkResponse();
      }
    }

    const container = await new ServiceContainerBuilder()
      .setup(new UseCommands([TestCommandHandler]))
      .setup(new UseQueries([TestQueryHandler]))
      .buildContainerAsync();

    server = await new ExpressAppBuilder({ port, logger, container })
      .use(
        new UseControllers({
          controllers: [TestController],
          logger,
        })
      )
      .buildAsync();

    const response = await fetch(`${serverAddress}/test`);
    expect(response.status).toBe(statusCodes.ok);

    expect(collectedData.length).toBe(3);
    expect(collectedData[0]).toBe(dataFromController);
    expect(collectedData[1]).toBe(dataFromCommand);
    expect(collectedData[2]).toBe(dataFromQuery);
  });

  it("Can use with CQRS and MikroORM", async () => {
    @Entity()
    class TestDocument {
      @PrimaryKey()
      _id!: ObjectId;

      @Property()
      someProperty!: string;
    }

    class CreateTestDocumentCommand {
      constructor(readonly someProperty: string) {}
    }

    class GetTestDocumentQuery {
      constructor(readonly someProperty: string) {}
    }

    @commandHandler(CreateTestDocumentCommand)
    class CreateTestDocumentCommandHandler implements CommandHandler<CreateTestDocumentCommand> {
      constructor(
        @injectRepository(TestDocument) private readonly repo: Repository<TestDocument>
      ) {}

      async execute(command: CreateTestDocumentCommand): Promise<void> {
        const document = new TestDocument();
        document.someProperty = command.someProperty;
        await this.repo.persistAndFlush(document);
      }
    }

    @queryHandler(GetTestDocumentQuery)
    class GetTestDocumentQueryHandler implements QueryHandler<GetTestDocumentQuery, TestDocument> {
      constructor(
        @injectRepository(TestDocument) private readonly repo: Repository<TestDocument>
      ) {}

      async fetch(query: GetTestDocumentQuery): Promise<TestDocument> {
        const document = await this.repo.findOne({ someProperty: query.someProperty });
        return document!;
      }
    }

    @controller("test")
    class TestController {
      constructor(
        @inject(CommandDispatcher) private readonly commands: CommandDispatcher,
        @inject(QueryDispatcher) private readonly queries: QueryDispatcher
      ) {}

      @httpPost()
      async post() {
        await this.commands.execute(new CreateTestDocumentCommand("someProperty"));
        return new OkResponse();
      }

      @httpGet()
      async get() {
        return await this.queries.fetch(new GetTestDocumentQuery("someProperty"));
      }
    }

    const container = await new ServiceContainerBuilder()
      .setup(
        new UseMikroOrm({
          mikroOrmOptions: {
            options: {
              clientUrl: "mongodb://host.docker.internal:27017",
              dbName: "tomasjs-tests-express",
              entities: [TestDocument],
              allowGlobalContext: true,
              type: "mongo",
            },
          },
        })
      )
      .setup(new UseRepositories("mongo", [TestDocument]))
      .setup(new UseCommands([CreateTestDocumentCommandHandler]))
      .setup(new UseQueries([GetTestDocumentQueryHandler]))
      .buildContainerAsync();

    server = await new ExpressAppBuilder({ port, logger, container })
      .use(
        new UseControllers({
          controllers: [TestController],
          logger,
        })
      )
      .buildAsync();

    const responseForPost = await fetch(`${serverAddress}/test`, { method: "post" });
    expect(responseForPost.status).toBe(statusCodes.ok);

    const responseForGet = await fetch(`${serverAddress}/test`);
    expect(responseForGet.status).toBe(statusCodes.ok);

    const responseForGetBody = await responseForGet.json();
    expect(responseForGetBody).toBeTruthy();
    expect(responseForGetBody.someProperty).toEqual("someProperty");
  });

  async function disposeAsync() {
    server?.close();
  }
});
