import "reflect-metadata";
import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { controller } from "./@controller";
import { httpGet } from "./@http";
import { Logger, ServiceContainerBuilder, injectable } from "@tomasjs/core";
import { TestContext } from "@/tests";
import { AppBuilder } from "@/builder";
import axios from "axios";
import { Middleware, MiddlewareResult } from "@/middleware";
import { HttpContext, HttpNextFunction } from "@/core";

const testSuiteName = "controllers/controllerLevelMiddlewares";

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

  it("Can bootstrap controller-level middlewares", (done) => {
    const collectedData: number[] = [];

    @injectable()
    class FirstMiddleware implements Middleware {
      delegate(context: HttpContext, next: HttpNextFunction): MiddlewareResult {
        logger.debug("first middleware!");
        collectedData.push(1);
        next();
      }
    }

    @injectable()
    class SecondMiddleware implements Middleware {
      delegate(context: HttpContext, next: HttpNextFunction): MiddlewareResult {
        logger.debug("second middleware!");
        collectedData.push(2);
        next();
      }
    }

    @controller("/", { middlewares: [FirstMiddleware, SecondMiddleware] })
    class TestController {
      @httpGet()
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
        new AppBuilder({ port, logger, container })
          .useControllers(TestController)
          .buildAsync()
          .then((server) => {
            context.server = server;
            axios.get(address);
          });
      });
  });
});
