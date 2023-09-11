import "reflect-metadata";
import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { controller } from "./@controller";
import { httpGet } from "./@http";
import { param } from "./@param";
import { AppBuilder } from "../builder";
import { UseControllers } from "./UseControllers";
import { Logger, numberTransform } from "@tomasjs/core";
import { TestContext } from "@/tests";
import axios from "axios";

const testSuiteName = "controllers/@param";

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

  it("The @param decorator injects a url path parameter into a controller's method parameter", (done) => {
    const expectedParam = "someCoolUsername";

    @controller("test")
    class TestController {
      @httpGet(":id")
      find(@param("id") id: string) {
        expect(id).toEqual(expectedParam);
        done();
      }
    }

    new AppBuilder({ port, logger })
      .use(new UseControllers({ controllers: [TestController], logger }))
      .buildAsync()
      .then((server) => {
        context.server = server;
        axios.get(`${address}/test/${expectedParam}`);
      });
  });

  it("Can use a Transform in a @param decorator", (done) => {
    const expectedParam = 2022;

    @controller("test")
    class TestController {
      @httpGet(":id")
      find(@param("id", { transform: numberTransform }) id: number) {
        expect(id).toBe(expectedParam);
        done();
      }
    }

    new AppBuilder({ port, logger })
      .use(new UseControllers({ controllers: [TestController], logger }))
      .buildAsync()
      .then((server) => {
        context.server = server;
        axios.get(`${address}/test/${expectedParam}`);
      });
  });
});
