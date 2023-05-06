import "reflect-metadata";
import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { Server } from "http";
import fetch from "node-fetch";
import { controller } from "./@controller";
import { httpGet } from "./@http";
import { param } from "./@param";
import { bootstrapLoggerFactory } from "@tomasjs/logging";
import { ExpressAppBuilder } from "../builder";
import { UseControllers } from "./UseControllers";

describe("controllers-paramDecorator", () => {
  let server: Server | undefined;
  const port = 3004;
  const serverAddress = `http://localhost:${port}`;
  const logger = bootstrapLoggerFactory("error");

  beforeEach(async () => {
    await disposeAsync();
  });

  afterEach(async () => {
    await disposeAsync();
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

    new ExpressAppBuilder({ port, logger })
      .use(new UseControllers({ controllers: [TestController], logger }))
      .buildAsync()
      .then((expressServer) => {
        server = expressServer;
        fetch(`${serverAddress}/test/${expectedParam}`);
      });
  });

  async function disposeAsync() {
    server?.close();
  }
});
