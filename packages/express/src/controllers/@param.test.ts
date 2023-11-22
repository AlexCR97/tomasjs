import "reflect-metadata";
import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { controller } from "./@controller";
import { httpGet } from "./@http";
import { param } from "./@param";
import { AppBuilder } from "../builder";
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

  it("The @param decorator injects a single url path parameter into a controller's method", (done) => {
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
      .useControllers(TestController)
      .buildAsync()
      .then((server) => {
        context.server = server;
        axios.get(`${address}/test/${expectedParam}`);
      });
  });

  it("The @param decorator injects multiple url path parameters into a controller's method", (done) => {
    const expectedParamFoo = "foo";
    const expectedParamBar = "bar";

    @controller("test")
    class TestController {
      @httpGet("/:foo/path/:bar")
      find(@param("foo") foo: string, @param("bar") bar: string) {
        expect(foo).toEqual(expectedParamFoo);
        expect(bar).toEqual(expectedParamBar);
        done();
      }
    }

    new AppBuilder({ port, logger })
      .useControllers(TestController)
      .buildAsync()
      .then((server) => {
        context.server = server;
        axios.get(`${address}/test/${expectedParamFoo}/path/${expectedParamBar}`);
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
      .useControllers(TestController)
      .buildAsync()
      .then((server) => {
        context.server = server;
        axios.get(`${address}/test/${expectedParam}`);
      });
  });
});
