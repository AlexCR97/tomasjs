import "reflect-metadata";
import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { Server } from "http";
import fetch from "node-fetch";
import { body } from "./@body";
import { controller } from "./@controller";

import { ExpressAppBuilder, UseJson } from "../builder";
import { UseControllers } from "./UseControllers";
import { httpPost } from "./@http";
import { TomasLogger } from "@tomasjs/core";

describe("controllers-bodyDecorator", () => {
  let server: Server | undefined;
  const port = 3003;
  const serverAddress = `http://localhost:${port}`;
  const logger = new TomasLogger("controllers-bodyDecorator", "error");

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

    @controller()
    class TestController {
      @httpPost()
      find(@body() body: any) {
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
