import "reflect-metadata";
import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import axios from "axios";
import fetch from "node-fetch";
import { Server } from "http";
import { controller } from "./@controller";
import { httpGet } from "./@http";
import { UseControllers } from "./UseControllers";
import { ExpressAppBuilder } from "../builder";
import { statusCodes } from "../core";
import { OkResponse } from "../responses/status-codes";
import { Guard, GuardContext, GuardResult, guard } from "../guards";
import { ServiceContainerBuilder, TomasLogger } from "@tomasjs/core";

describe("controllers-UseControllers", () => {
  let server: Server | undefined;
  const port = 3002;
  const serverAddress = `http://localhost:${port}`;
  const logger = new TomasLogger("controllers-UseControllers", "error");

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

  async function disposeAsync() {
    server?.close();
  }
});
