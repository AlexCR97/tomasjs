import "reflect-metadata";
import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { bootstrapLoggerFactory } from "@tomasjs/logging";
import axios from "axios";
import fetch from "node-fetch";
import { Server } from "http";
import { controller } from "./@controller";
import { httpGet } from "./@http";
import { UseControllers } from "./UseControllers";
import { ExpressAppBuilder } from "../builder";
import { statusCodes } from "../core";
import { OkResponse } from "../responses/status-codes";
import { Guard, GuardContext, guard } from "../guards";
import { ServiceContainerBuilder } from "@tomasjs/core";

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
    //@ts-ignore TODO Fix decorators not working in test files
    @controller("test")
    class TestController {
      //@ts-ignore TODO Fix decorators not working in test files
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

    //@ts-ignore: Fix decorators not working in test files
    @controller("users")
    class UsersController {
      //@ts-ignore: Fix decorators not working in test files
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

  it("Can use a controller-level guard", async () => {
    const collectedData: string[] = [];
    const dataFromGuard = "Data from TestGuard";
    const dataFromFirstController = "Data from FirstController";
    const dataFromSecondController = "Data from SecondController";

    //@ts-ignore TODO Fix decorators not working in test files
    @guard()
    class TestGuard implements Guard {
      isAllowed(context: GuardContext) {
        collectedData.push(dataFromGuard);
        return true;
      }
    }

    //@ts-ignore TODO Fix decorators not working in test files
    @controller("first", { guards: [TestGuard] })
    class FirstController {
      //@ts-ignore TODO Fix decorators not working in test files
      @httpGet()
      get() {
        collectedData.push(dataFromFirstController);
        return new OkResponse();
      }
    }

    //@ts-ignore TODO Fix decorators not working in test files
    @controller("second")
    class SecondController {
      //@ts-ignore TODO Fix decorators not working in test files
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

  async function disposeAsync() {
    server?.close();
  }
});
