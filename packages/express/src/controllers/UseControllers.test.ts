import "reflect-metadata";
import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { bootstrapLoggerFactory } from "@tomasjs/logging";
import axios from "axios";
import { Server } from "http";
import { controller } from "./@controller";
import { get } from "./@http";
import { UseControllers } from "./UseControllers";
import { ExpressAppBuilder } from "../builder";
import { statusCodes } from "../core";
import { OkResponse } from "../responses/status-codes";

describe("controllers-UseControllers", () => {
  let server: Server | undefined;
  const port = 3002;
  const logger = bootstrapLoggerFactory("debug");

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
      @get()
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

    const response = await axios.get(`http://localhost:${port}/test`);

    expect(response.status).toBe(statusCodes.ok);
  });

  async function disposeAsync() {
    server?.close();
  }
});
