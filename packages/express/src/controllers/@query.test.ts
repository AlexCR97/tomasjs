import "reflect-metadata";
import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { Server } from "http";
import fetch from "node-fetch";
import { controller } from "./@controller";
import { get } from "./@http";
import { query } from "./@query";
import { bootstrapLoggerFactory } from "@tomasjs/logging";
import { ExpressAppBuilder } from "../builder";
import { UseControllers } from "./UseControllers";

describe("controllers-queryDecorator", () => {
  let server: Server | undefined;
  const port = 3005;
  const serverAddress = `http://localhost:${port}`;
  const logger = bootstrapLoggerFactory("error");

  beforeEach(async () => {
    await disposeAsync();
  });

  afterEach(async () => {
    await disposeAsync();
  });

  it("The @query decorator can inject a single query param into the controller's method parameter", (done) => {
    const expectedQuery = "10";

    //@ts-ignore: Fix decorators not working in test files
    @controller("test")
    class TestController {
      //@ts-ignore: Fix decorators not working in test files
      @get()
      find(
        //@ts-ignore: Fix decorators not working in test files
        @query("pageIndex") pageIndex: string
      ) {
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

    //@ts-ignore: Fix decorators not working in test files
    @controller("test")
    class TestController {
      //@ts-ignore: Fix decorators not working in test files
      @get()
      find(
        //@ts-ignore: Fix decorators not working in test files
        @query() query: any
      ) {
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
    const logger = bootstrapLoggerFactory("debug");

    const expectedQuery = {
      pageIndex: "10",
      pageSize: "40",
    };

    //@ts-ignore: Fix decorators not working in test files
    @controller("test")
    class TestController {
      //@ts-ignore: Fix decorators not working in test files
      @get()
      find(
        //@ts-ignore: Fix decorators not working in test files
        @query("pageIndex") pageIndex: string,
        //@ts-ignore: Fix decorators not working in test files
        @query("pageSize") pageSize: string
      ) {
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
