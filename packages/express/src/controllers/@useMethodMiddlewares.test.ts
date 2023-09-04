import "reflect-metadata";
import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { controller } from "./@controller";
import { httpGet } from "./@http";
import { UseControllers } from "./UseControllers";
import { Logger, ServiceContainerBuilder, injectable } from "@tomasjs/core";
import { Request, Response, NextFunction } from "express";
import { TestContext } from "@/tests";
import { Middleware } from "@/middleware";
import { ExpressAppBuilder } from "@/builder";
import axios from "axios";

const testSuiteName = "controllers/methodLevelMiddlewares";

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
          .then((server) => {
            context.server = server;
            axios.get(address);
          });
      });
  });
});
