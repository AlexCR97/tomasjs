import "express-async-errors";
import "reflect-metadata";
import fetch from "node-fetch";
import { afterEach, beforeEach, describe, it } from "@jest/globals";
import { tryCloseServerAsync } from "@/tests/utils";
import { internalContainer, inject } from "@/container";
import { controller } from "../@controller";
import { ControllerMetadata, HttpMethodMetadata } from "../metadata";
import { get, http, post } from "../@http";
import { HttpMethod, StatusCodes } from "@/core";
import { AppBuilder, ContainerBuilder } from "@/builder";
import { body } from "../@body";
import { param } from "../@param";
import { query } from "../@query";
import { headers } from "../@headers";
import { Headers } from "@/core/express";
import { header } from "../@header";
import { AddQueryHandlers, QueryDispatcher, QueryHandler, queryHandler } from "../../cqrs/";
import { singleton } from "../../container";
import { HttpContext } from "../../core";
import { Guard, GuardContext, guard } from "../../guards";
import { Middleware } from "../../middleware";
import { StatusCodeResponse } from "../../responses";
import { NextFunction } from "express";
import { useMethodGuard } from "../@useMethodGuard";
import { useMethodMiddleware } from "../@useMethodMiddleware";

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

  it(`A Controller can be decorated`, () => {
    // Arrange
    const expectedPath = "test";

    @controller(expectedPath)
    class TestController {}

    // Act/Assert
    const registeredController = internalContainer.get<TestController>(TestController);
    expect(registeredController).toBeTruthy();

    const metadata = new ControllerMetadata(registeredController);
    expect(metadata.path).toEqual(expectedPath);
  });

  it("A controller can declare http methods", () => {
    // Arrange
    interface ExpectedMethod {
      method: HttpMethod;
      path: string;
    }

    const expectedGetMethod: ExpectedMethod = {
      method: "get",
      path: "test",
    };

    const expectedPostMethod: ExpectedMethod = {
      method: "post",
      path: "foo",
    };

    @controller()
    class TestController {
      @http(expectedGetMethod.method, expectedGetMethod.path)
      getMethod() {}

      @post(expectedPostMethod.path)
      postMethod() {}
    }

    // Act
    const registeredController = internalContainer.get<TestController>(TestController);
    const decoratedProperties = Reflect.getMetadataKeys(registeredController);
    // console.log("decoratedProperties", decoratedProperties);

    // Assert (GET method)
    const getMethodKey = decoratedProperties.find((key) => key === "getMethod");
    expect(getMethodKey).toBeTruthy();

    const getMethodMetadata = new HttpMethodMetadata(registeredController, getMethodKey);
    expect(getMethodMetadata.httpMethod).toBe(expectedGetMethod.method);
    expect(getMethodMetadata.path).toBe(expectedGetMethod.path);

    // Assert (POST method)
    const postMethodKey = decoratedProperties.find((key) => key === "postMethod");
    expect(postMethodKey).toBeTruthy();

    const postMethodMetadata = new HttpMethodMetadata(registeredController, postMethodKey);
    expect(postMethodMetadata.httpMethod).toBe(expectedPostMethod.method);
    expect(postMethodMetadata.path).toBe(expectedPostMethod.path);
  });

  it("A controller can be registered in the http pipeline", async () => {
    // Arrange

    interface User {
      email: string;
      password: string;
    }

    const expectedFetchedUser: User = {
      email: "example@domain.com",
      password: "123456",
    };

    @controller("users")
    class UsersController {
      @get("paged")
      find(): User[] {
        return [expectedFetchedUser];
      }
    }

    server = await new AppBuilder().useJson().useController(UsersController).buildAsync(port);

    // Act/Assert
    const response = await fetch(`${serverAddress}/users/paged`);
    expect(response.status).toBe(StatusCodes.ok);

    const responseJson = await response.json();
    const responseUser = responseJson[0];
    expect(responseUser).toEqual(expectedFetchedUser);
  });

  it("A controller method can inject the request body with the @body decorator", async () => {
    // Arrange

    const expectedBody = {
      email: "example@domain.com",
      password: "123456",
    };

    @controller()
    class TestController {
      @post()
      find(@body() body: any) {
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
    expect(response.status).toBe(StatusCodes.ok);

    const responseJson = await response.json();
    expect(responseJson).toEqual(expectedBody);
  });

  it("A controller method can inject a request url param with the @param decorator", async () => {
    // Arrange

    const expectedParam = "someCoolUsername";

    @controller("test")
    class TestController {
      @get(":id")
      find(@param("id") id: string) {
        return id;
      }
    }

    server = await new AppBuilder().useJson().useController(TestController).buildAsync(port);

    // Act
    const response = await fetch(`${serverAddress}/test/${expectedParam}`);

    // Assert
    expect(response.status).toBe(StatusCodes.ok);

    const responseText = await response.text();
    expect(responseText).toEqual(expectedParam);
  });

  it("A controller method can inject a single query param with the @query decorator", async () => {
    // Arrange

    const expectedQuery = "10";

    @controller("test")
    class TestController {
      @get()
      find(@query("pageIndex") pageIndex: string) {
        return pageIndex;
      }
    }

    server = await new AppBuilder().useJson().useController(TestController).buildAsync(port);

    // Act
    const response = await fetch(`${serverAddress}/test?pageIndex=${expectedQuery}`);

    // Assert
    expect(response.status).toBe(StatusCodes.ok);

    const responseText = await response.text();
    expect(responseText).toEqual(expectedQuery);
  });

  it("A controller method can inject a the entire query object with the @query decorator", async () => {
    // Arrange

    const expectedQuery = {
      pageIndex: "10",
      pageSize: "40",
    };

    @controller("test")
    class TestController {
      @get()
      find(@query() query: any) {
        return query;
      }
    }

    server = await new AppBuilder().useJson().useController(TestController).buildAsync(port);

    // Act
    const response = await fetch(
      `${serverAddress}/test?pageIndex=${expectedQuery.pageIndex}&pageSize=${expectedQuery.pageSize}`
    );

    // Assert
    expect(response.status).toBe(StatusCodes.ok);

    const responseJson = await response.json();
    expect(responseJson).toEqual(expectedQuery);
  });

  it("A controller method can inject multiple query params with the @query decorator", async () => {
    // Arrange

    const expectedQuery = {
      pageIndex: "10",
      pageSize: "40",
    };

    @controller("test")
    class TestController {
      @get()
      find(@query("pageIndex") pageIndex: string, @query("pageSize") pageSize: string) {
        return { pageIndex, pageSize };
      }
    }

    server = await new AppBuilder().useJson().useController(TestController).buildAsync(port);

    // Act
    const response = await fetch(
      `${serverAddress}/test?pageIndex=${expectedQuery.pageIndex}&pageSize=${expectedQuery.pageSize}`
    );

    // Assert
    expect(response.status).toBe(StatusCodes.ok);

    const responseJson = await response.json();
    expect(responseJson).toEqual(expectedQuery);
  });

  it("A controller method can inject the request headers with the @headers decorator", async () => {
    // Arrange

    const expectedHeaderValue = "Bearer someValidJwt";

    @controller()
    class TestController {
      @post()
      find(@headers() headers: Headers) {
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
    expect(response.status).toBe(StatusCodes.ok);

    const responseText = await response.text();
    expect(responseText).toEqual(expectedHeaderValue);
  });

  it("A controller method can inject multiple request headers with the @header decorator", async () => {
    // Arrange

    const expectedHeaders = {
      client_id: "123",
      client_secret: "456",
    };

    @controller("test")
    class TestController {
      @post("token")
      find(@header("client_id") clientId: string, @header("client_secret") clientSecret: string) {
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
    expect(response.status).toBe(StatusCodes.ok);

    const responseJson = await response.json();
    expect(responseJson).toEqual(expectedHeaders);
  });

  it("A controller method can attach a middleware using the @middleware decorator", async () => {
    @singleton()
    class TestMiddleware implements Middleware {
      handle(context: HttpContext, next: NextFunction): void | Promise<void> {
        console.log("TestMiddleware!"!);
        return next();
      }
    }

    @controller()
    class TestController {
      @useMethodMiddleware(TestMiddleware)
      @get()
      getMethod() {
        return new StatusCodeResponse(StatusCodes.ok);
      }
    }

    const registeredController = internalContainer.get<TestController>(TestController);
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

    @singleton()
    class TestMiddleware implements Middleware {
      handle(context: HttpContext, next: NextFunction): void | Promise<void> {
        initialValue = expectedValue;
        return next();
      }
    }

    @controller()
    class TestController {
      @useMethodMiddleware(TestMiddleware)
      @get()
      getMethod() {
        return new StatusCodeResponse(StatusCodes.ok);
      }
    }

    server = await new AppBuilder().useJson().useController(TestController).buildAsync(port);

    const response = await fetch(`${serverAddress}`);
    expect(response.status).toBe(StatusCodes.ok);
    expect(initialValue).toBe(expectedValue);
  });

  it("A controller method can attach and use a guard using the @guard decorator", async () => {
    @guard()
    class TestGuard implements Guard {
      isAllowed(context: GuardContext) {
        return false;
      }
    }

    @controller()
    class TestController {
      @useMethodGuard(TestGuard)
      @get()
      getMethod() {
        return new StatusCodeResponse(StatusCodes.ok);
      }
    }

    server = await new AppBuilder().useJson().useController(TestController).buildAsync(port);

    const response = await fetch(`${serverAddress}`);
    expect(response.status).toBe(StatusCodes.unauthorized);
  });

  it("A controller can inject a QueryHandler", async () => {
    // Arrange
    const expectedId = "123";

    class TestQuery {
      constructor(readonly id: string) {}
    }

    @queryHandler(TestQuery)
    class TestQueryHandler implements QueryHandler<TestQuery, string> {
      fetch(query: TestQuery): string | Promise<string> {
        // console.log("TestQueryHandler.fetch", query);
        return query.id;
      }
    }

    @controller("test")
    class TestController {
      constructor(@inject(QueryDispatcher) private readonly queries: QueryDispatcher) {}

      @get(":id")
      async find(@param("id") id: string) {
        // console.log("TestController.find:", id);
        return await this.queries.fetch(new TestQuery(id));
      }
    }

    await new ContainerBuilder().setup(new AddQueryHandlers([TestQueryHandler])).buildAsync();

    server = await new AppBuilder().useJson().useController(TestController).buildAsync(port);

    // Act

    const response = await fetch(`${serverAddress}/test/${expectedId}`);

    // Assert
    expect(response.status).toBe(StatusCodes.ok);

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

    @queryHandler(GetQuery)
    class TestGetQueryHandler extends GetQueryHandler<GetQuery> {}

    @controller("test")
    class TestController {
      constructor(@inject(QueryDispatcher) private readonly queries: QueryDispatcher) {}

      @get(":id")
      async find(@param("id") id: string) {
        // console.log("TestController.find:", id);
        return await this.queries.fetch(new GetQuery(id));
      }
    }

    await new ContainerBuilder().setup(new AddQueryHandlers([TestGetQueryHandler])).buildAsync();

    server = await new AppBuilder().useJson().useController(TestController).buildAsync(port);

    // Act

    const response = await fetch(`${serverAddress}/test/${expectedId}`);

    // Assert
    expect(response.status).toBe(StatusCodes.ok);

    const responseText = await response.text();
    expect(responseText).toEqual(expectedId);
  });
});
