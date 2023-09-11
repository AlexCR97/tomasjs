import "reflect-metadata";
import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { controller } from "./@controller";
import { header } from "./@header";
import { httpPost } from "./@http";
import { UseControllers } from "./UseControllers";
import { Logger } from "@tomasjs/core";
import { TestContext } from "@/tests";
import { AppBuilder } from "@/builder";
import axios from "axios";

const testSuiteName = "controllers/@header";

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

  it("The @header decorator can inject multiple request headers into the controller's method parameters", (done) => {
    const expectedHeaders = {
      client_id: "123",
      client_secret: "456",
    };

    @controller("test")
    class TestController {
      @httpPost("token")
      find(@header("client_id") clientId: string, @header("client_secret") clientSecret: string) {
        expect(clientId).toEqual(expectedHeaders.client_id);
        expect(clientSecret).toEqual(expectedHeaders.client_secret);
        done();
      }
    }

    new AppBuilder({ port, logger })
      .use(new UseControllers({ controllers: [TestController], logger }))
      .buildAsync()
      .then((server) => {
        context.server = server;

        axios.post(
          `${address}/test/token`,
          {},
          {
            headers: {
              client_id: expectedHeaders.client_id,
              client_secret: expectedHeaders.client_secret,
            },
          }
        );
      });
  });
});
