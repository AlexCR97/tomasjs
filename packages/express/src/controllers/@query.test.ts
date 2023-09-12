import "reflect-metadata";
import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { controller } from "./@controller";
import { httpGet } from "./@http";
import { query } from "./@query";
import { Logger, TomasLogger } from "@tomasjs/core";
import { TestContext } from "@/tests";
import axios from "axios";
import { AppBuilder } from "@/builder";

const testSuiteName = "controllers/@query";

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

  it("The @query decorator can inject a single query param into the controller's method parameter", (done) => {
    const expectedQuery = "10";

    @controller("test")
    class TestController {
      @httpGet()
      find(@query("pageIndex") pageIndex: string) {
        expect(pageIndex).toEqual(expectedQuery);
        done();
      }
    }

    new AppBuilder({ port, logger })
      .useControllers(TestController)
      .buildAsync()
      .then((server) => {
        context.server = server;
        axios.get(`${address}/test?pageIndex=${expectedQuery}`);
      });
  });

  it("The @query decorator can inject the entire query object into the controller's method parameter", (done) => {
    const expectedQuery = {
      pageIndex: "10",
      pageSize: "40",
    };

    @controller("test")
    class TestController {
      @httpGet()
      find(@query() query: any) {
        expect(query).toEqual(expectedQuery);
        done();
      }
    }

    new AppBuilder({ port, logger })
      .useControllers(TestController)
      .buildAsync()
      .then((server) => {
        context.server = server;
        axios.get(
          `${address}/test?pageIndex=${expectedQuery.pageIndex}&pageSize=${expectedQuery.pageSize}`
        );
      });
  });

  it("The @query decorator can inject multiple query params into the controller's method parameters", (done) => {
    const logger = new TomasLogger("test", "error");

    const expectedQuery = {
      pageIndex: "10",
      pageSize: "40",
    };

    @controller("test")
    class TestController {
      @httpGet()
      find(@query("pageIndex") pageIndex: string, @query("pageSize") pageSize: string) {
        expect(pageIndex).toEqual(expectedQuery.pageIndex);
        expect(pageSize).toEqual(expectedQuery.pageSize);
        done();
      }
    }

    new AppBuilder({ port, logger })
      .useControllers(TestController)
      .buildAsync()
      .then((server) => {
        context.server = server;

        axios.get(
          `${address}/test?pageIndex=${expectedQuery.pageIndex}&pageSize=${expectedQuery.pageSize}`
        );
      });
  });
});
