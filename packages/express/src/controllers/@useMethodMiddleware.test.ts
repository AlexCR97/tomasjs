import "reflect-metadata";
import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { Server } from "http";
import fetch from "node-fetch";
import { controller } from "./@controller";
import { get } from "./@http";
import { bootstrapLoggerFactory } from "@tomasjs/logging";
import { ExpressAppBuilder } from "../builder";
import { UseControllers } from "./UseControllers";
import { injectable } from "@tomasjs/core";
import { Middleware } from "../middleware";
import { HttpContext } from "../core";
import { NextFunction } from "express";
import { useMethodMiddleware } from "./@useMethodMiddleware";

describe("controllers-useMethodMiddlewareDecorator", () => {
  let server: Server | undefined;
  const port = 3008;
  const serverAddress = `http://localhost:${port}`;
  const logger = bootstrapLoggerFactory("error");

  beforeEach(async () => {
    await disposeAsync();
  });

  afterEach(async () => {
    await disposeAsync();
  });

  it("The @useMethodMiddleware bootstraps a method-level middleware", (done) => {
    const collectedData: string[] = [];

    //@ts-ignore: Fix decorators not working in test files
    @injectable()
    class FirstMiddleware implements Middleware {
      handle(context: HttpContext, next: NextFunction): void | Promise<void> {
        collectedData.push(FirstMiddleware.name);
        return next();
      }
    }

    //@ts-ignore: Fix decorators not working in test files
    @injectable()
    class SecondMiddleware implements Middleware {
      handle(context: HttpContext, next: NextFunction): void | Promise<void> {
        collectedData.push(SecondMiddleware.name);
        return next();
      }
    }

    //@ts-ignore: Fix decorators not working in test files
    @controller()
    class TestController {
      //@ts-ignore: Fix decorators not working in test files
      @useMethodMiddleware(FirstMiddleware)
      //@ts-ignore: Fix decorators not working in test files
      @get()
      getMethod() {
        console.log("collectedData", collectedData);
        expect(collectedData[0]).toBe(FirstMiddleware.name);
        expect(collectedData[1]).toBe(SecondMiddleware.name);
        done();
      }
    }

    new ExpressAppBuilder({ port, logger })
      .use(new UseControllers({ controllers: [TestController], logger }))
      .buildAsync()
      .then((expressServer) => {
        server = expressServer;
        fetch(serverAddress);
      });
  });

  async function disposeAsync() {
    server?.close();
  }
});
