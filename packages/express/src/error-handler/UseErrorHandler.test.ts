import "express-async-errors";
import "reflect-metadata";
import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { bootstrapLoggerFactory } from "@tomasjs/logging";
import { Server } from "http";
import fetch from "node-fetch";
import { UseControllers, controller, httpGet } from "@/controllers";
import { NotImplementedError } from "@tomasjs/core";
import { ExpressAppBuilder } from "@/builder";
import { TomasErrorHandler, UseErrorHandler } from ".";
import { statusCodes } from "@/core";
import { TomasErrorHandlerFactory } from "./TomasErrorHandlerFactory";

describe("errorHandlers-UseErrorHandler", () => {
  let server: Server | undefined;
  const port = 3017;
  const serverAddress = `http://localhost:${port}`;
  const logger = bootstrapLoggerFactory("debug");

  beforeEach(async () => {
    await disposeAsync();
  });

  afterEach(async () => {
    await disposeAsync();
  });

  it("Can use TomasErrorHandler", async () => {
    @controller()
    class TestController {
      @httpGet()
      get() {
        throw new NotImplementedError(this.get.name);
      }
    }

    await new ExpressAppBuilder({ port, logger })
      .use(new UseControllers({ controllers: [TestController], logger }))
      .use(new UseErrorHandler({ errorHandler: new TomasErrorHandler() }))
      .buildAsync();

    const response = await fetch(`${serverAddress}`);
    expect(response.status).toBe(statusCodes.internalServerError);
  });

  it("Can use TomasErrorHandlerFactory", async () => {
    const port = 3018;

    @controller()
    class TestController {
      @httpGet()
      get() {
        throw new NotImplementedError(this.get.name);
      }
    }

    await new ExpressAppBuilder({ port, logger })
      .use(new UseControllers({ controllers: [TestController], logger }))
      .use(
        new UseErrorHandler({
          errorHandler: new TomasErrorHandlerFactory({
            logger,
            includeStackTrace: true,
          }),
        })
      )
      .buildAsync();

    const response = await fetch(`${serverAddress}`);
    expect(response.status).toBe(statusCodes.internalServerError);

    const responseJson = await response.json();
    console.log("responseJson", responseJson);
  });

  async function disposeAsync() {
    server?.close();
  }
});
