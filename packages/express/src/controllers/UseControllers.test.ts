import "reflect-metadata";
import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import axios from "axios";
import { controller } from "./@controller";
import { httpGet } from "./@http";
import { Logger, ServiceContainerBuilder, injectable } from "@tomasjs/core";
import { TestContext } from "@/tests";
import { OkResponse } from "@/responses";
import { AppBuilder } from "@/builder";
import { statusCodes } from "@/core";
import { Guard, GuardContext, GuardResult } from "@/guards";

const testSuiteName = "controllers/UseControllers";

describe(testSuiteName, () => {
  let context: TestContext;
  let port: number;
  let address: string;
  let logger: Logger;

  beforeEach(async () => {
    context = await TestContext.new(testSuiteName);
    port = context.port;
    address = context.address;
    logger = context.logger;
  });

  afterEach(async () => {
    await context.dispose();
  });

  it("Can bootstrap a Controller", async () => {
    @controller("test")
    class TestController {
      @httpGet()
      get() {
        return new OkResponse();
      }
    }

    context.server = await new AppBuilder({ port, logger })
      .useControllers(TestController)
      .buildAsync();

    const response = await axios.get(`${address}/test`);

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

    context.server = await new AppBuilder({ port, logger })
      .useControllers(UsersController)
      .buildAsync();

    // Act/Assert
    const response = await axios.get(`${address}/users/paged`);
    expect(response.status).toBe(statusCodes.ok);

    const responseJson = await response.data;
    const responseUser = responseJson[0];
    expect(responseUser).toEqual(expectedFetchedUser);
  });

  it("Can use controller-level guards", async () => {
    const collectedData: string[] = [];
    const dataFromGuard = "Data from TestGuard";
    const dataFromFirstController = "Data from FirstController";
    const dataFromSecondController = "Data from SecondController";

    @injectable()
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

    context.server = await new AppBuilder({ port, logger, container })
      .useControllers(FirstController, SecondController)
      .buildAsync();

    const secondResponse = await axios.get(`${address}/second`);
    expect(secondResponse.status).toBe(statusCodes.ok);

    const firstResponse = await axios.get(`${address}/first`);
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

    @injectable()
    class ControllerGuard implements Guard {
      isAllowed(context: GuardContext) {
        collectedData.push(dataFromControllerGuard);
        return true;
      }
    }

    @injectable()
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

    context.server = await new AppBuilder({ port, logger, container })
      .useControllers(FirstController, SecondController)
      .buildAsync();

    const secondResponse = await axios.get(`${address}/second`);
    expect(secondResponse.status).toBe(statusCodes.ok);

    const firstResponse = await axios.get(`${address}/first`);
    expect(firstResponse.status).toBe(statusCodes.ok);

    expect(collectedData.length).toBe(5);
    expect(collectedData[0]).toBe(dataFromMethodGuard);
    expect(collectedData[1]).toBe(dataFromSecondController);
    expect(collectedData[2]).toBe(dataFromControllerGuard);
    expect(collectedData[3]).toBe(dataFromMethodGuard);
    expect(collectedData[4]).toBe(dataFromFirstController);
  });
});
