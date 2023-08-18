import "reflect-metadata";
import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { Server } from "http";
import fetch from "node-fetch";
import { controller } from "./@controller";
import { header } from "./@header";
import { httpPost } from "./@http";
import { bootstrapLoggerFactory } from "@tomasjs/logging";
import { ExpressAppBuilder } from "../builder";
import { UseControllers } from "./UseControllers";

describe("controllers-headerDecorator", () => {
  let server: Server | undefined;
  const port = 3007;
  const serverAddress = `http://localhost:${port}`;
  const logger = bootstrapLoggerFactory("error");

  beforeEach(async () => {
    await disposeAsync();
  });

  afterEach(async () => {
    await disposeAsync();
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

    new ExpressAppBuilder({ port, logger })
      .use(new UseControllers({ controllers: [TestController], logger }))
      .buildAsync()
      .then((expressServer) => {
        server = expressServer;

        fetch(`${serverAddress}/test/token`, {
          method: "post",
          body: JSON.stringify({}),
          headers: {
            client_id: expectedHeaders.client_id,
            client_secret: expectedHeaders.client_secret,
          },
        });
      });
  });

  async function disposeAsync() {
    server?.close();
  }
});
