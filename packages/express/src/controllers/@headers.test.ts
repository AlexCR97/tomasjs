import "reflect-metadata";
import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { Server } from "http";
import fetch from "node-fetch";
import { controller } from "./@controller";
import { headers } from "./@headers";
import { httpPost } from "./@http";
import { bootstrapLoggerFactory } from "@tomasjs/logging";
import { ExpressAppBuilder } from "../builder";
import { UseControllers } from "./UseControllers";
import { Headers } from "../core/express";

describe("controllers-headersDecorator", () => {
  let server: Server | undefined;
  const port = 3006;
  const serverAddress = `http://localhost:${port}`;
  const logger = bootstrapLoggerFactory("error");

  beforeEach(async () => {
    await disposeAsync();
  });

  afterEach(async () => {
    await disposeAsync();
  });

  it("The @headers decorator can inject the request headers into the controller's method parameters", (done) => {
    const expectedHeaderValue = "Bearer someValidJwt";

    //@ts-ignore: Fix decorators not working in test files
    @controller()
    class TestController {
      //@ts-ignore: Fix decorators not working in test files
      @httpPost()
      find(
        //@ts-ignore: Fix decorators not working in test files
        @headers() headers: Headers
      ) {
        expect(headers).toBeTruthy();
        expect(headers.authorization).toEqual(expectedHeaderValue);
        done();
      }
    }

    new ExpressAppBuilder({ port, logger })
      .use(new UseControllers({ controllers: [TestController], logger }))
      .buildAsync()
      .then((expressServer) => {
        server = expressServer;

        fetch(serverAddress, {
          method: "post",
          body: JSON.stringify({}),
          headers: { authorization: expectedHeaderValue },
        });
      });
  });

  async function disposeAsync() {
    server?.close();
  }
});
