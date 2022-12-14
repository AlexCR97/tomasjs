import "reflect-metadata";
import fetch from "node-fetch";
import { afterEach, describe, it } from "@jest/globals";
import { AppBuilder } from "../../src/builder";
import { HttpContext, StatusCodes } from "../../src/core";
import { AnonymousEndpoint, endpoint, Endpoint, middleware, path } from "../../src/endpoints";
import { AnonymousMiddleware } from "../../src/middleware";
import { JsonResponse, PlainTextResponse } from "../../src/responses";
import { OkResponse, StatusCodeResponse } from "../../src/responses/status-codes";
import { tryCloseServerAsync } from "../utils/server";
import { tick } from "../utils/time";

describe("endpoints", () => {
  const port = 3033;
  const serverAddress = `http://localhost:${port}`;
  const serverTeardownOffsetMilliseconds = 0;
  let server: any; // TODO Set http.Server type

  beforeEach(async () => {
    await tick(serverTeardownOffsetMilliseconds);
    await tryCloseServerAsync(server);
  });

  afterEach(async () => {
    await tick(serverTeardownOffsetMilliseconds);
    await tryCloseServerAsync(server);
  });

  it(`An Endpoint instance works`, async () => {
    // Arrange

    @endpoint()
    class TestEndpoint implements Endpoint {
      handle(context: HttpContext) {
        return new OkResponse();
      }
    }

    server = await new AppBuilder().useEndpoint(new TestEndpoint()).buildAsync(port);

    // Act
    const response = await fetch(serverAddress);

    // Assert
    expect(response.status).toEqual(StatusCodes.ok);
  });

  it(`An Endpoint constructor works`, async () => {
    // Arrange

    @endpoint()
    class TestEndpoint implements Endpoint {
      handle(context: HttpContext): OkResponse {
        return new OkResponse();
      }
    }

    server = await new AppBuilder().useEndpoint(TestEndpoint).buildAsync(port);

    // Act
    const response = await fetch(serverAddress);

    // Assert
    expect(response.status).toEqual(StatusCodes.ok);
  });

  it(`An ${AnonymousEndpoint.name} instance works`, async () => {
    // Arrange

    server = await new AppBuilder()
      .useEndpoint(new AnonymousEndpoint("get", "/", () => new OkResponse()))
      .buildAsync(port);

    // Act
    const response = await fetch(serverAddress);

    // Assert
    expect(response.status).toEqual(StatusCodes.ok);
  });

  it("All content-type responses work", async () => {
    // Arrange

    @endpoint()
    @path(StatusCodeEndpoint.path)
    class StatusCodeEndpoint implements Endpoint {
      static path = "status-code";
      static expectedStatusCode = StatusCodes.noContent;
      handle(context: HttpContext) {
        return new StatusCodeResponse(StatusCodeEndpoint.expectedStatusCode);
      }
    }

    @endpoint()
    @path(PlainTextEndpoint.path)
    class PlainTextEndpoint implements Endpoint {
      static path = "plain-text";
      static expectedPlainText = "plain text test";
      handle(context: HttpContext) {
        return new PlainTextResponse(PlainTextEndpoint.expectedPlainText);
      }
    }

    @endpoint()
    @path(JsonEndpoint.path)
    class JsonEndpoint implements Endpoint {
      static path = "json";
      static expectedJson = { key: "test-key", value: "test-value" };
      handle(context: HttpContext) {
        return new JsonResponse(JsonEndpoint.expectedJson);
      }
    }

    server = await new AppBuilder()
      .useEndpoint(StatusCodeEndpoint)
      .useEndpoint(PlainTextEndpoint)
      .useEndpoint(JsonEndpoint)
      .buildAsync(port);

    // Act
    const statusCodeResponse = await fetch(`${serverAddress}/${StatusCodeEndpoint.path}`);
    const plainTextResponse = await fetch(`${serverAddress}/${PlainTextEndpoint.path}`);
    const jsonResponse = await fetch(`${serverAddress}/${JsonEndpoint.path}`);

    // Assert
    expect(statusCodeResponse.status).toEqual(StatusCodeEndpoint.expectedStatusCode);
    expect(plainTextResponse.text()).resolves.toEqual(PlainTextEndpoint.expectedPlainText);
    expect(jsonResponse.json()).resolves.toEqual(JsonEndpoint.expectedJson);
  });

  it(`The request path can be extracted from the HttpContext`, async () => {
    // Arrange
    const expectedPath = "path/to/resource";

    @endpoint()
    @path(expectedPath)
    class TestEndpoint implements Endpoint {
      handle(context: HttpContext) {
        return context.request.path;
      }
    }

    server = await new AppBuilder().useEndpoint(TestEndpoint).buildAsync(port);

    // Act
    const response = await fetch(`${serverAddress}/${expectedPath}`);

    // Assert
    expect(response.status).toBe(StatusCodes.ok);
    expect(response.text()).resolves.toEqual(`/${expectedPath}`);
  });

  it(`The request headers can be extracted from the HttpContext`, async () => {
    // Arrange
    interface TestHeader {
      key: string;
      value: string;
    }

    @endpoint()
    class TestEndpoint implements Endpoint {
      handle(context: HttpContext) {
        return new JsonResponse(context.request.headers);
      }
    }

    const expectedResponseHeader: TestHeader = {
      key: "test-header-key",
      value: "test-header-value",
    };

    server = await new AppBuilder().useJson().useEndpoint(TestEndpoint).buildAsync(port);

    // Act
    const customHeaders: any = {};
    customHeaders[expectedResponseHeader.key] = expectedResponseHeader.value;

    const response = await fetch(serverAddress, {
      headers: { ...customHeaders },
    });

    // Assert
    expect(response.status).toBe(StatusCodes.ok);

    const responseJson = await response.json();
    expect(responseJson[expectedResponseHeader.key]).toEqual(expectedResponseHeader.value);
  });

  it(`The request params can be extracted from the HttpContext`, async () => {
    // Arrange
    const expectedPath = "users/:id/profile/:profileId";
    const expectedPathValues = {
      id: 123,
      profileId: 246,
    };

    @endpoint()
    @path(expectedPath)
    class TestEndpoint implements Endpoint {
      handle(context: HttpContext) {
        return new JsonResponse({
          id: Number(context.request.params.id),
          profileId: Number(context.request.params.profileId),
        });
      }
    }

    server = await new AppBuilder().useEndpoint(TestEndpoint).buildAsync(port);

    // Act
    const response = await fetch(
      `${serverAddress}/${expectedPath
        .replace(":id", expectedPathValues.id.toString())
        .replace(":profileId", expectedPathValues.profileId.toString())}`
    );

    // Assert
    expect(response.status).toBe(StatusCodes.ok);
    expect(response.json()).resolves.toEqual(expectedPathValues);
  });

  it(`The request query can be extracted from the HttpContext`, async () => {
    // Arrange
    const expectedPath = "users";
    const expectedQueryParams = {
      pageIndex: 3,
      pageSize: 16,
    };

    @endpoint()
    @path(expectedPath)
    class TestEndpoint implements Endpoint {
      handle(context: HttpContext) {
        return new JsonResponse({
          pageIndex: Number(context.request.query.pageIndex),
          pageSize: Number(context.request.query.pageSize),
        });
      }
    }

    server = await new AppBuilder().useEndpoint(TestEndpoint).buildAsync(port);

    // Act
    const queryParams = new URLSearchParams();
    queryParams.set("pageIndex", "3");
    queryParams.set("pageSize", "16");
    const requestUrl = `${serverAddress}/${expectedPath}?${queryParams.toString()}`;
    const response = await fetch(requestUrl);

    // Assert
    expect(response.status).toBe(StatusCodes.ok);
    expect(response.json()).resolves.toEqual(expectedQueryParams);
  });

  it(`The request body can be extracted as plain text from the HttpContext if the "useText" method was used first`, async () => {
    // Arrange
    const expectedResponse = "Plain text body works!";

    @endpoint("post")
    class TestEndpoint implements Endpoint {
      handle(context: HttpContext) {
        return context.request.body;
      }
    }

    server = await new AppBuilder().useText().useEndpoint(TestEndpoint).buildAsync(port);

    // Act
    const response = await fetch(serverAddress, {
      method: "post",
      body: expectedResponse,
      headers: { "Content-Type": "text/plain" },
    });

    // Assert
    expect(response.status).toBe(StatusCodes.ok);
    expect(response.text()).resolves.toEqual(expectedResponse);
  });

  it(`The request body can be extracted as json from the HttpContext if the "useJson" method was used first`, async () => {
    // Arrange
    interface TestBody {
      email: string;
      password: string;
    }

    @endpoint("post")
    class TestEndpoint implements Endpoint {
      handle(context: HttpContext) {
        const body: TestBody = context.request.body;
        return new JsonResponse(body, {
          status: StatusCodes.created,
        });
      }
    }

    const expectedResponse: TestBody = {
      email: "example@address.com",
      password: "123456",
    };

    server = await new AppBuilder().useJson().useEndpoint(TestEndpoint).buildAsync(port);

    // Act
    const response = await fetch(serverAddress, {
      method: "post",
      body: JSON.stringify(expectedResponse),
      headers: { "Content-Type": "application/json" },
    });

    // Assert
    expect(response.status).toBe(StatusCodes.created);
    expect(response.json()).resolves.toEqual(expectedResponse);
  });

  it(`An onBefore Middleware can intercept the request headers`, async () => {
    // Arrange
    const expectedPath = "path/to/authorized/resource";
    const headerKey = "authorization";
    const secretKey = "superSecretKey";

    @endpoint("post")
    @path(expectedPath)
    @middleware(
      new AnonymousMiddleware((context, next) => {
        const token = context.request.headers[headerKey];

        if (token !== secretKey) {
          context.response.status(StatusCodes.unauthorized).send();
          return;
        }

        next();
      })
    )
    class TestEndpoint implements Endpoint {
      handle(context: HttpContext): string {
        return context.request.headers[headerKey] as string;
      }
    }

    server = await new AppBuilder().useJson().useEndpoint(TestEndpoint).buildAsync(port);

    // Act
    const unauthorizedResponse = await fetch(`${serverAddress}/${expectedPath}`, {
      method: "post",
    });

    const customHeaders: any = {};
    customHeaders[headerKey] = secretKey;
    const authorizedResponse = await fetch(`${serverAddress}/${expectedPath}`, {
      method: "post",
      headers: { ...customHeaders },
    });

    // Assert
    expect(unauthorizedResponse.status).toBe(StatusCodes.unauthorized);
    expect(authorizedResponse.status).toBe(StatusCodes.ok);
    expect(authorizedResponse.text()).resolves.toEqual(secretKey);
  });
});
