import "express-async-errors";
import "reflect-metadata";
import fetch from "node-fetch";
import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { controller } from "../@controller";
import { ControllerMetadata, HttpMethodMetadata } from "../metadata";
import { get, http, post } from "../@http";
import { body } from "../@body";
import { param } from "../@param";
import { query } from "../@query";
import { headers } from "../@headers";
import { header } from "../@header";
import { AddQueryHandlers, QueryDispatcher, QueryHandler, queryHandler } from "@tomasjs/cqrs";
import { HttpContext, HttpMethod, statusCodes } from "../../core";
import { Guard, GuardContext, guard } from "../../guards";
import { Middleware } from "../../middleware";
import { StatusCodeResponse } from "../../responses";
import { NextFunction } from "express";
import { useMethodGuard } from "../@useMethodGuard";
import { useMethodMiddleware } from "../@useMethodMiddleware";
import { tryCloseServerAsync } from "../../tests/utils";
import { ContainerBuilder, globalContainer, inject, singleton } from "@tomasjs/core";
import { AppBuilder } from "../../builder";
import { Headers } from "../../core/express";

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

  it("A controller method can inject the request body with the @body decorator", async () => {
    // Arrange

    const expectedBody = {
      email: "example@domain.com",
      password: "123456",
    };

    //@ts-ignore: Fix decorators not working in test files
    @controller()
    class TestController {
      //@ts-ignore: Fix decorators not working in test files
      @post()
      find(
        //@ts-ignore: Fix decorators not working in test files
        @body() body: any
      ) {
        return body;
      }
    }

    server = await new AppBuilder().useJson().useController(TestController).buildAsync(port);

    // Act
    const response = await fetch(serverAddress, {
      method: "post",
      body: JSON.stringify(expectedBody),
      headers: { "Content-Type": "application/json" },
    });

    // Assert
    expect(response.status).toBe(statusCodes.ok);

    const responseJson = await response.json();
    expect(responseJson).toEqual(expectedBody);
  });

  it("A controller method can inject a request url param with the @param decorator", async () => {
    // Arrange

    const expectedParam = "someCoolUsername";

    //@ts-ignore: Fix decorators not working in test files
    @controller("test")
    class TestController {
      //@ts-ignore: Fix decorators not working in test files
      @get(":id")
      find(
        //@ts-ignore: Fix decorators not working in test files
        @param("id") id: string
      ) {
        return id;
      }
    }

    server = await new AppBuilder().useJson().useController(TestController).buildAsync(port);

    // Act
    const response = await fetch(`${serverAddress}/test/${expectedParam}`);

    // Assert
    expect(response.status).toBe(statusCodes.ok);

    const responseText = await response.text();
    expect(responseText).toEqual(expectedParam);
  });

  it("A controller method can inject a single query param with the @query decorator", async () => {
    // Arrange

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
        return pageIndex;
      }
    }

    server = await new AppBuilder().useJson().useController(TestController).buildAsync(port);

    // Act
    const response = await fetch(`${serverAddress}/test?pageIndex=${expectedQuery}`);

    // Assert
    expect(response.status).toBe(statusCodes.ok);

    const responseText = await response.text();
    expect(responseText).toEqual(expectedQuery);
  });

  it("A controller method can inject a the entire query object with the @query decorator", async () => {
    // Arrange

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
        return query;
      }
    }

    server = await new AppBuilder().useJson().useController(TestController).buildAsync(port);

    // Act
    const response = await fetch(
      `${serverAddress}/test?pageIndex=${expectedQuery.pageIndex}&pageSize=${expectedQuery.pageSize}`
    );

    // Assert
    expect(response.status).toBe(statusCodes.ok);

    const responseJson = await response.json();
    expect(responseJson).toEqual(expectedQuery);
  });

  it("A controller method can inject multiple query params with the @query decorator", async () => {
    // Arrange

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
        return { pageIndex, pageSize };
      }
    }

    server = await new AppBuilder().useJson().useController(TestController).buildAsync(port);

    // Act
    const response = await fetch(
      `${serverAddress}/test?pageIndex=${expectedQuery.pageIndex}&pageSize=${expectedQuery.pageSize}`
    );

    // Assert
    expect(response.status).toBe(statusCodes.ok);

    const responseJson = await response.json();
    expect(responseJson).toEqual(expectedQuery);
  });

  it("A controller method can inject the request headers with the @headers decorator", async () => {
    // Arrange

    const expectedHeaderValue = "Bearer someValidJwt";

    //@ts-ignore: Fix decorators not working in test files
    @controller()
    class TestController {
      //@ts-ignore: Fix decorators not working in test files
      @post()
      find(
        //@ts-ignore: Fix decorators not working in test files
        @headers() headers: Headers
      ) {
        return headers.authorization;
      }
    }

    server = await new AppBuilder().useJson().useController(TestController).buildAsync(port);

    // Act
    const response = await fetch(serverAddress, {
      method: "post",
      body: JSON.stringify({}),
      headers: { authorization: expectedHeaderValue },
    });

    // Assert
    expect(response.status).toBe(statusCodes.ok);

    const responseText = await response.text();
    expect(responseText).toEqual(expectedHeaderValue);
  });

  it("A controller method can inject multiple request headers with the @header decorator", async () => {
    // Arrange

    const expectedHeaders = {
      client_id: "123",
      client_secret: "456",
    };

    //@ts-ignore: Fix decorators not working in test files
    @controller("test")
    class TestController {
      //@ts-ignore: Fix decorators not working in test files
      @post("token")
      find(
        //@ts-ignore: Fix decorators not working in test files
        @header("client_id") clientId: string,
        //@ts-ignore: Fix decorators not working in test files
        @header("client_secret") clientSecret: string
      ) {
        return {
          client_id: clientId,
          client_secret: clientSecret,
        };
      }
    }

    server = await new AppBuilder().useJson().useController(TestController).buildAsync(port);

    // Act
    const response = await fetch(`${serverAddress}/test/token`, {
      method: "post",
      body: JSON.stringify({}),
      headers: {
        client_id: expectedHeaders.client_id,
        client_secret: expectedHeaders.client_secret,
      },
    });

    // Assert
    expect(response.status).toBe(statusCodes.ok);

    const responseJson = await response.json();
    expect(responseJson).toEqual(expectedHeaders);
  });

  it("A controller method can attach a middleware using the @middleware decorator", async () => {
    //@ts-ignore: Fix decorators not working in test files
    @singleton()
    class TestMiddleware implements Middleware {
      handle(context: HttpContext, next: NextFunction): void | Promise<void> {
        console.log("TestMiddleware!"!);
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

    const registeredController = globalContainer.get<TestController>(TestController);
    const decoratedProperties = Reflect.getMetadataKeys(registeredController);
    // console.log("decoratedProperties", decoratedProperties);

    const getMethodKey = decoratedProperties.find((key) => key === "getMethod");
    expect(getMethodKey).toBeTruthy();

    const getMethodMetadata = new HttpMethodMetadata(registeredController, getMethodKey);
    // console.log("getMethodMetadata", getMethodMetadata);
    // console.log("getMethodMetadata.middlewares", getMethodMetadata.middlewares);
    expect(getMethodMetadata.middlewares).toBeTruthy();
    expect(getMethodMetadata.middlewares!.length).toBe(1);
    // console.log("getMethodMetadata.middlewares![0]", getMethodMetadata.middlewares![0]);
    expect(getMethodMetadata.middlewares![0]).toBeInstanceOf(Function);
    expect((getMethodMetadata.middlewares![0] as Function).name).toBe(TestMiddleware.name);
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
