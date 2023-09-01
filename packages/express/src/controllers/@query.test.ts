import "reflect-metadata";
import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { Server } from "http";
import fetch from "node-fetch";
import { controller } from "./@controller";
import { httpGet } from "./@http";
import { query } from "./@query";
import { ExpressAppBuilder } from "../builder";
import { UseControllers } from "./UseControllers";
import { TomasLogger } from "@tomasjs/core";

describe("controllers-queryDecorator", () => {
  let server: Server | undefined;
  const port = 3005;
  const serverAddress = `http://localhost:${port}`;
  const logger = new TomasLogger("controllers-queryDecorator", "error");

  beforeEach(async () => {
    await disposeAsync();
  });

  afterEach(async () => {
    await disposeAsync();
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

    new ExpressAppBuilder({ port, logger })
      .use(new UseControllers({ controllers: [TestController], logger }))
      .buildAsync()
      .then((expressServer) => {
        server = expressServer;
        fetch(`${serverAddress}/test?pageIndex=${expectedQuery}`);
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

    new ExpressAppBuilder({ port, logger })
      .use(new UseControllers({ controllers: [TestController], logger }))
      .buildAsync()
      .then((expressServer) => {
        server = expressServer;
        fetch(
          `${serverAddress}/test?pageIndex=${expectedQuery.pageIndex}&pageSize=${expectedQuery.pageSize}`
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

    new ExpressAppBuilder({ port, logger })
      .use(new UseControllers({ controllers: [TestController], logger }))
      .buildAsync()
      .then((expressServer) => {
        server = expressServer;

        fetch(
          `${serverAddress}/test?pageIndex=${expectedQuery.pageIndex}&pageSize=${expectedQuery.pageSize}`
        );
      });
  });

  async function disposeAsync() {
    server?.close();
  }
});
