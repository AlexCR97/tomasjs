import "express-async-errors";
import "reflect-metadata";
import fetch from "node-fetch";
import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { controller } from "../@controller";
import { get } from "../@http";
import { param } from "../@param";
import { AddQueryHandlers, QueryDispatcher, QueryHandler, queryHandler } from "@tomasjs/cqrs";
import { HttpContext, statusCodes } from "../../core";
import { Guard, GuardContext, guard } from "../../guards";
import { Middleware } from "../../middleware";
import { StatusCodeResponse } from "../../responses";
import { NextFunction } from "express";
import { useMethodGuard } from "../@useMethodGuard";
import { useMethodMiddleware } from "../@useMethodMiddleware";
import { tryCloseServerAsync } from "../../tests/utils";
import { inject } from "@tomasjs/core";
import { AppBuilder } from "../../builder";

describe("controllers", () => {
  const port = 3045;
  const serverAddress = `http://localhost:${port}`;
  let server: any; // TODO Set http.Server type

  beforeEach(async () => {
    await tryCloseServerAsync(server);
  });

  afterEach(async () => {
    await tryCloseServerAsync(server);
  });

  it("A controller method can attach and use a middleware using the @middleware decorator", async () => {
    let initialValue = 1;
    const expectedValue = 2;

    //@ts-ignore: Fix decorators not working in test files
    @singleton()
    class TestMiddleware implements Middleware {
      handle(context: HttpContext, next: NextFunction): void | Promise<void> {
        initialValue = expectedValue;
        return next();
      }
    }

    //@ts-ignore: Fix decorators not working in test files
    @controller()
    class TestController {
      //@ts-ignore: Fix decorators not working in test files
      @useMethodMiddleware(TestMiddleware)
      //@ts-ignore: Fix decorators not working in test files
      @get()
      getMethod() {
        return new StatusCodeResponse(statusCodes.ok);
      }
    }

    server = await new AppBuilder().useJson().useController(TestController).buildAsync(port);

    const response = await fetch(`${serverAddress}`);
    expect(response.status).toBe(statusCodes.ok);
    expect(initialValue).toBe(expectedValue);
  });

  it("A controller method can attach and use a guard using the @guard decorator", async () => {
    //@ts-ignore: Fix decorators not working in test files
    @guard()
    class TestGuard implements Guard {
      isAllowed(context: GuardContext) {
        return false;
      }
    }

    //@ts-ignore: Fix decorators not working in test files
    @controller()
    class TestController {
      //@ts-ignore: Fix decorators not working in test files
      @useMethodGuard(TestGuard)
      //@ts-ignore: Fix decorators not working in test files
      @get()
      getMethod() {
        return new StatusCodeResponse(statusCodes.ok);
      }
    }

    server = await new AppBuilder().useJson().useController(TestController).buildAsync(port);

    const response = await fetch(`${serverAddress}`);
    expect(response.status).toBe(statusCodes.unauthorized);
  });

  it("A controller can inject a QueryHandler", async () => {
    // Arrange
    const expectedId = "123";

    class TestQuery {
      constructor(readonly id: string) {}
    }

    //@ts-ignore: Fix decorators not working in test files
    @queryHandler(TestQuery)
    class TestQueryHandler implements QueryHandler<TestQuery, string> {
      fetch(query: TestQuery): string | Promise<string> {
        // console.log("TestQueryHandler.fetch", query);
        return query.id;
      }
    }

    //@ts-ignore: Fix decorators not working in test files
    @controller("test")
    class TestController {
      constructor(
        //@ts-ignore: Fix decorators not working in test files
        @inject(QueryDispatcher) private readonly queries: QueryDispatcher
      ) {}

      //@ts-ignore: Fix decorators not working in test files
      @get(":id")
      async find(
        //@ts-ignore: Fix decorators not working in test files
        @param("id") id: string
      ) {
        // console.log("TestController.find:", id);
        return await this.queries.fetch(new TestQuery(id));
      }
    }

    await new ContainerBuilder().setup(new AddQueryHandlers([TestQueryHandler])).buildAsync();

    server = await new AppBuilder().useJson().useController(TestController).buildAsync(port);

    // Act

    const response = await fetch(`${serverAddress}/test/${expectedId}`);

    // Assert
    expect(response.status).toBe(statusCodes.ok);

    const responseText = await response.text();
    expect(responseText).toEqual(expectedId);
  });

  it("A controller can inject a QueryHandler with inheritance", async () => {
    // Arrange
    const expectedId = "123";

    class GetQuery {
      constructor(readonly id: string) {}
    }

    abstract class GetQueryHandler<TQuery extends GetQuery>
      implements QueryHandler<TQuery, string>
    {
      fetch(query: TQuery): string {
        // console.log("GetQueryHandler.fetch", query);
        return query.id;
      }
    }

    //@ts-ignore: Fix decorators not working in test files
    @queryHandler(GetQuery)
    class TestGetQueryHandler extends GetQueryHandler<GetQuery> {}

    //@ts-ignore: Fix decorators not working in test files
    @controller("test")
    class TestController {
      constructor(
        //@ts-ignore: Fix decorators not working in test files
        @inject(QueryDispatcher) private readonly queries: QueryDispatcher
      ) {}

      //@ts-ignore: Fix decorators not working in test files
      @get(":id")
      async find(
        //@ts-ignore: Fix decorators not working in test files
        @param("id") id: string
      ) {
        // console.log("TestController.find:", id);
        return await this.queries.fetch(new GetQuery(id));
      }
    }

    await new ContainerBuilder().setup(new AddQueryHandlers([TestGetQueryHandler])).buildAsync();

    server = await new AppBuilder().useJson().useController(TestController).buildAsync(port);

    // Act

    const response = await fetch(`${serverAddress}/test/${expectedId}`);

    // Assert
    expect(response.status).toBe(statusCodes.ok);

    const responseText = await response.text();
    expect(responseText).toEqual(expectedId);
  });
});
