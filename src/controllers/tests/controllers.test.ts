import "express-async-errors";
import "reflect-metadata";
import fetch from "node-fetch";
import { afterEach, beforeEach, describe, it } from "@jest/globals";
import { tryCloseServerAsync } from "@/tests/utils";
import { internalContainer } from "@/container";
import { controller } from "../@controller";
import { ControllerMetadata, HttpMethodMetadata } from "../metadata";
import { get, http, post } from "../@http";
import { HttpMethod, StatusCodes } from "@/core";
import { AppBuilder } from "@/builder";
import { body } from "../@body";
import { param } from "../@param";
import { query } from "../@query";
import { headers } from "../@headers";
import { Headers } from "@/core/express";
import { header } from "../@header";

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
});

// class CreateUserRequest {}

// class FindRequest {}

// class UpdateUserRequest {}

// class UpdateUserProfileRequest {}

// @controller("users")
// @useMiddleware(undefined as any)
// @useInterceptor(undefined as any)
// @useGuard(undefined as any)
// export class UsersController {
//   @post()
//   create(@body() body: CreateUserRequest) {}

//   @get()
//   find(@query() query: FindRequest) {}

//   @get(":id")
//   get(@param("id") id: string) {}

//   @get(":id/profile")
//   getProfile(@param("id") id: string) {}

//   @put(":id")
//   update(@param("id") id: string, @body() body: UpdateUserRequest) {}

//   @patch(":id/profile")
//   updateProfile(@param("id") id: string, @body() body: UpdateUserProfileRequest) {}

//   @http("delete", ":id")
//   delete(@param("id") id: string) {}
// }
