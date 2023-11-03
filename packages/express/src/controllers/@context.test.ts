import "reflect-metadata";
import { afterEach, beforeEach, describe, it } from "@jest/globals";
import { context } from "./@context";
import { controller } from "./@controller";
import { httpGet } from "./@http";
import { Logger } from "@tomasjs/core";
import { TestContext } from "@/tests";
import { HttpContext, isHttpContext } from "@/core";
import { AppBuilder } from "@/builder";

const testSuiteName = "controllers/@context";

describe(testSuiteName, () => {
  let testContext: TestContext;
  let port: number;
  let address: string;
  let logger: Logger;

  beforeEach(async () => {
    testContext = await TestContext.new(testSuiteName);
    port = testContext.port;
    address = testContext.address;
    logger = testContext.logger;
  });

  afterEach(async () => {
    await testContext.dispose();
  });

  it("The @context decorator injects the HttpContext instance into a controller's method parameters", (done) => {
    @controller("test")
    class TestController {
      @httpGet()
      find(@context() context: HttpContext) {
        expect(isHttpContext(context)).toBeTruthy();
        done();
      }
    }

    new AppBuilder({ port, logger })
      .useControllers(TestController)
      .buildAsync()
      .then((server) => {
        testContext.server = server;
        fetch(`${address}/test`);
      });
  });
});
