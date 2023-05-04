import "reflect-metadata";
import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { bootstrapLoggerFactory } from "@tomasjs/logging";
import axios from "axios";
import { Server } from "http";
import { controller } from "./@controller";
import { httpGet } from "./@http";
import { UseControllers } from "./UseControllers";
import { ExpressAppBuilder } from "../builder";
import { statusCodes } from "../core";
import { OkResponse } from "../responses/status-codes";

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

  async function disposeAsync() {
    server?.close();
  }
});
