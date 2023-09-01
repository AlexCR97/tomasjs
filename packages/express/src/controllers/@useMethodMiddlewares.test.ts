import "reflect-metadata";
import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { Server } from "http";
import { controller } from "./@controller";
import { httpGet } from "./@http";
import { UseControllers } from "./UseControllers";
import { ExpressAppBuilder } from "../builder";
import { ServiceContainerBuilder, TomasLogger, injectable } from "@tomasjs/core";
import { Middleware } from "../middleware";
import { Request, Response, NextFunction } from "express";

describe("controllers-useMethodMiddlewaresDecorator", () => {
  let server: Server | undefined;
  const port = 3011;
  const serverAddress = `http://localhost:${port}`;
  const logger = new TomasLogger("controllers-useMethodMiddlewaresDecorator", "error");

  beforeEach(async () => {
    await disposeAsync();
  });

  afterEach(async () => {
    await disposeAsync();
  });

  it("Can bootstrap method-level middlewares", (done) => {
    const collectedData: number[] = [];

    @injectable()
    class FirstMiddleware implements Middleware {
      handle(req: Request, res: Response, next: NextFunction): void | Promise<void> {
        logger.debug("first middleware!");
        collectedData.push(1);
        next();
      }
    }

    @injectable()
    class SecondMiddleware implements Middleware {
      handle(req: Request, res: Response, next: NextFunction): void | Promise<void> {
        logger.debug("second middleware!");
        collectedData.push(2);
        next();
      }
    }

    @controller()
    class TestController {
      @httpGet("/", { middlewares: [FirstMiddleware, SecondMiddleware] })
      get() {
        expect(collectedData.length).toBe(2);
        expect(collectedData[0]).toBe(1);
        expect(collectedData[1]).toBe(2);
        done();
      }
    }

    new ServiceContainerBuilder()
      .addClass(FirstMiddleware)
      .addClass(SecondMiddleware)
      .buildContainerAsync()
      .then((container) => {
        new ExpressAppBuilder({ port, logger, container })
          .use(
            new UseControllers({
              controllers: [TestController],
              logger,
            })
          )
          .buildAsync()
          .then((expressServer) => {
            server = expressServer;
            fetch(serverAddress);
          });
      });
  });

  async function disposeAsync() {
    server?.close();
  }
});
