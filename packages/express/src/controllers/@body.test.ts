import "reflect-metadata";
import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { body } from "./@body";
import { controller } from "./@controller";
import { UseControllers } from "./UseControllers";
import { httpPost } from "./@http";
import { Logger } from "@tomasjs/core";
import { TestContext } from "@/tests";
import { AppBuilder, UseJson } from "@/builder";
import axios from "axios";

const testSuiteName = "controllers/@body";

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

  it("The @body decorator injects the request body into the controller's method parameter", (done) => {
    const expectedBody = {
      email: "example@domain.com",
      password: "123456",
    };

    @controller()
    class TestController {
      @httpPost()
      find(@body() body: any) {
        expect(body).toEqual(expectedBody);
        done();
      }
    }

    new AppBuilder({ port, logger })
      .use(new UseJson())
      .use(
        new UseControllers({
          controllers: [TestController],
          logger,
        })
      )
      .buildAsync()
      .then((server) => {
        context.server = server;
        axios.post(address, expectedBody);
      });
  });
});
