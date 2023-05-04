import "reflect-metadata";
import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { Server } from "http";
import fetch from "node-fetch";
import { body } from "./@body";
import { controller } from "./@controller";

import { bootstrapLoggerFactory } from "@tomasjs/logging";
import { ExpressAppBuilder, UseJson } from "../builder";
import { UseControllers } from "./UseControllers";
import { httpPost } from "./@http";

describe("controllers-bodyDecorator", () => {
  let server: Server | undefined;
  const port = 3003;
  const serverAddress = `http://localhost:${port}`;
  const logger = bootstrapLoggerFactory("error");

  beforeEach(async () => {
    await disposeAsync();
  });

  afterEach(async () => {
    await disposeAsync();
  });

  it("The @body decorator injects the request body into the controller's method parameter", (done) => {
    const expectedBody = {
      email: "example@domain.com",
      password: "123456",
    };

    //@ts-ignore: Fix decorators not working in test files
    @controller()
    class TestController {
      //@ts-ignore: Fix decorators not working in test files
      @httpPost()
      find(
        //@ts-ignore: Fix decorators not working in test files
        @body() body: any
      ) {
        expect(body).toEqual(expectedBody);
        done();
      }
    }

    new ExpressAppBuilder({ port, logger })
      .use(new UseJson())
      .use(
        new UseControllers({
          controllers: [TestController],
          logger,
        })
      )
      .buildAsync()
      .then((expressServer) => {
        server = expressServer;

        fetch(serverAddress, {
          method: "post",
          body: JSON.stringify(expectedBody),
          headers: { "Content-Type": "application/json" },
        });
      });
  });

  async function disposeAsync() {
    server?.close();
  }
});
