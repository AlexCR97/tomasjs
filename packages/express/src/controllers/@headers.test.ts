import "reflect-metadata";
import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { controller } from "./@controller";
import { headers } from "./@headers";
import { httpPost } from "./@http";
import { TestContext } from "@/tests";
import { Logger } from "@tomasjs/core";
import { Headers } from "@/core/express";
import { AppBuilder } from "@/builder";
import axios from "axios";

const testSuiteName = "controllers/@headers";

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

  it("The @headers decorator can inject the request headers into the controller's method parameters", (done) => {
    const expectedHeaderValue = "Bearer someValidJwt";

    @controller()
    class TestController {
      @httpPost()
      find(@headers() headers: Headers) {
        expect(headers).toBeTruthy();
        expect(headers.authorization).toEqual(expectedHeaderValue);
        done();
      }
    }

    new AppBuilder({ port, logger })
      .useControllers(TestController)
      .buildAsync()
      .then((server) => {
        context.server = server;

        axios.post(
          address,
          {},
          {
            headers: { authorization: expectedHeaderValue },
          }
        );
      });
  });
});
