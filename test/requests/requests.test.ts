import "reflect-metadata";
import { afterEach, describe, it } from "@jest/globals";
import { tryCloseServerAsync } from "../utils/server";
import { AppBuilder } from "../../src/builder";
import { tick } from "../utils/time";
import { AnonymousRequestHandler, RequestHandler } from "../../src/requests";
import { HttpContext, StatusCodes } from "../../src/core";
import fetch from "node-fetch";
import { OkResponse, StatusCodeResponse } from "../../src/responses/status-codes";
import { JsonResponse, PlainTextResponse } from "../../src/responses";
import { AnonymousMiddleware } from "../../src/middleware";

describe.skip("RequestHandlers", () => {
  const port = 3032;
  const serverAddress = `http://localhost:${port}`;
  const serverTeardownOffsetMilliseconds = 100;
  let server: any; // TODO Set http.Server type

  beforeEach(async () => {
    await tick(serverTeardownOffsetMilliseconds);
    await tryCloseServerAsync(server);
  });

  afterEach(async () => {
    await tick(serverTeardownOffsetMilliseconds);
    await tryCloseServerAsync(server);
  });

  it(`The "useRequestHandler" method should throw if the "useRequestContext" method was not used first`, () => {
    // Arrange
    class TestRequestHandler extends RequestHandler<OkResponse> {
      handle(context: HttpContext): OkResponse {
        return new OkResponse();
      }
    }

    // Act/Assert
    expect(() => {
      new AppBuilder().useRequestHandler(TestRequestHandler);
    }).toThrow();
  });

  it(`The "useRequestHandler" method should work if the "useRequestContext" method was used first`, () => {
    // Arrange
    class TestRequestHandler extends RequestHandler<OkResponse> {
      handle(context: HttpContext): OkResponse {
        return new OkResponse();
      }
    }

    // Act/Assert
    expect(() => {
      new AppBuilder().useHttpContext().useRequestHandler(TestRequestHandler);
    }).not.toThrow();
  });

  it("A RequestHandler instance works", async () => {
    // Arrange
    class TestRequestHandler extends RequestHandler<OkResponse> {
      handle(context: HttpContext): OkResponse {
        return new OkResponse();
      }
    }

    server = await new AppBuilder()
      .useHttpContext()
      .useRequestHandler(new TestRequestHandler())
      .buildAsync(port);

    // Act
    const response = await fetch(serverAddress);

    // Assert
    expect(response.status).toEqual(StatusCodes.ok);
  });

  it("A RequestHandler constructor works", async () => {
    // Arrange
    class TestRequestHandler extends RequestHandler<OkResponse> {
      handle(context: HttpContext): OkResponse {
        return new OkResponse();
      }
    }

    server = await new AppBuilder()
      .useHttpContext()
      .useRequestHandler(TestRequestHandler)
      .buildAsync(port);

    // Act
    const response = await fetch(serverAddress);

    // Assert
    expect(response.status).toEqual(StatusCodes.ok);
  });

  it(`An ${AnonymousRequestHandler.name} instance works`, async () => {
    // Arrange

    server = await new AppBuilder()
      .useHttpContext()
      .useRequestHandler(
        new AnonymousRequestHandler("get", "/", () => {
          return new OkResponse();
        })
      )
      .buildAsync(port);

    // Act
    const response = await fetch(serverAddress);

    // Assert
    expect(response.status).toEqual(StatusCodes.ok);
  });

  it("All content-type responses work", async () => {
    // Arrange

    class StatusCodeRequestHandler extends RequestHandler<StatusCodeResponse> {
      static path = "status-code";
      static expectedStatusCode = StatusCodes.noContent;
      constructor() {
        super();
        this.path(`/${StatusCodeRequestHandler.path}`);
      }
      handle(context: HttpContext): StatusCodeResponse {
        return new StatusCodeResponse(StatusCodeRequestHandler.expectedStatusCode);
      }
    }

    class PlainTextRequestHandler extends RequestHandler<PlainTextResponse> {
      static path = "plain-text";
      static expectedPlainText = "plain text test";
      constructor() {
        super();
        this.path(`/${PlainTextRequestHandler.path}`);
      }
      handle(context: HttpContext): PlainTextResponse {
        return new PlainTextResponse(PlainTextRequestHandler.expectedPlainText);
      }
    }

    class JsonRequestHandler extends RequestHandler<JsonResponse> {
      static path = "json";
      static expectedJson = { key: "test-key", value: "test-value" };
      constructor() {
        super();
        this.path(`/${JsonRequestHandler.path}`);
      }
      handle(context: HttpContext): JsonResponse {
        return new JsonResponse(JsonRequestHandler.expectedJson);
      }
    }

    server = await new AppBuilder()
      .useHttpContext()
      .useRequestHandler(StatusCodeRequestHandler)
      .useRequestHandler(PlainTextRequestHandler)
      .useRequestHandler(JsonRequestHandler)
      .buildAsync(port);

    // Act
    const statusCodeResponse = await fetch(`${serverAddress}/${StatusCodeRequestHandler.path}`);
    const plainTextResponse = await fetch(`${serverAddress}/${PlainTextRequestHandler.path}`);
    const jsonResponse = await fetch(`${serverAddress}/${JsonRequestHandler.path}`);

    // Assert
    expect(statusCodeResponse.status).toEqual(StatusCodeRequestHandler.expectedStatusCode);
    expect(plainTextResponse.text()).resolves.toEqual(PlainTextRequestHandler.expectedPlainText);
    expect(jsonResponse.json()).resolves.toEqual(JsonRequestHandler.expectedJson);
  });

  it(`The request path can be extracted from the HttpContext`, async () => {
    // Arrange
    const expectedPath = "/path/to/resource";

    class TestRequestHandler extends RequestHandler<string> {
      constructor() {
        super();
        this.path(expectedPath);
      }
      handle(context: HttpContext): string {
        return context.request.path;
      }
    }

    server = await new AppBuilder()
      .useHttpContext()
      .useRequestHandler(TestRequestHandler)
      .buildAsync(port);

    // Act
    const response = await fetch(`${serverAddress}${expectedPath}`);

    // Assert
    expect(response.status).toBe(StatusCodes.ok);
    expect(response.text()).resolves.toEqual(expectedPath);
  });

  it(`The request headers can be extracted from the HttpContext`, async () => {
    // Arrange
    interface TestHeader {
      key: string;
      value: string;
    }

    class TestRequestHandler extends RequestHandler<JsonResponse> {
      handle(context: HttpContext): JsonResponse {
        return new JsonResponse(context.request.headers);
      }
    }

    const expectedResponseHeader: TestHeader = {
      key: "test-header-key",
      value: "test-header-value",
    };

    server = await new AppBuilder()
      .useJson()
      .useHttpContext()
      .useRequestHandler(TestRequestHandler)
      .buildAsync(port);

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
    const expectedPath = "/users/:id/profile/:profileId";
    const expectedPathValues = {
      id: 123,
      profileId: 246,
    };

    class TestRequestHandler extends RequestHandler<JsonResponse> {
      constructor() {
        super();
        this.path(expectedPath);
      }
      handle(context: HttpContext): JsonResponse {
        return new JsonResponse({
          id: Number(context.request.params.id),
          profileId: Number(context.request.params.profileId),
        });
      }
    }

    server = await new AppBuilder()
      .useHttpContext()
      .useRequestHandler(TestRequestHandler)
      .buildAsync(port);

    // Act
    const response = await fetch(
      `${serverAddress}${expectedPath
        .replace(":id", expectedPathValues.id.toString())
        .replace(":profileId", expectedPathValues.profileId.toString())}`
    );

    // Assert
    expect(response.status).toBe(StatusCodes.ok);
    expect(response.json()).resolves.toEqual(expectedPathValues);
  });

  it(`The request query can be extracted from the HttpContext`, async () => {
    // Arrange
    const expectedPath = "/users";
    const expectedQueryParams = {
      pageIndex: 3,
      pageSize: 16,
    };

    class TestRequestHandler extends RequestHandler<JsonResponse> {
      constructor() {
        super();
        this.path(expectedPath);
      }
      handle(context: HttpContext): JsonResponse {
        return new JsonResponse({
          pageIndex: Number(context.request.query.pageIndex),
          pageSize: Number(context.request.query.pageSize),
        });
      }
    }

    server = await new AppBuilder()
      .useHttpContext()
      .useRequestHandler(TestRequestHandler)
      .buildAsync(port);

    // Act
    const queryParams = new URLSearchParams();
    queryParams.set("pageIndex", "3");
    queryParams.set("pageSize", "16");
    const requestUrl = `${serverAddress}${expectedPath}?${queryParams.toString()}`;
    const response = await fetch(requestUrl);

    // Assert
    expect(response.status).toBe(StatusCodes.ok);
    expect(response.json()).resolves.toEqual(expectedQueryParams);
  });

  it(`The request body can be extracted as plain text from the HttpContext if the "useText" method was used first`, async () => {
    // Arrange
    const expectedResponse = "Plain text body works!";

    class TestRequestHandler extends RequestHandler<string> {
      constructor() {
        super();
        this.method("post");
      }
      handle(context: HttpContext): string {
        return context.request.body;
      }
    }

    server = await new AppBuilder()
      .useText()
      .useHttpContext()
      .useRequestHandler(TestRequestHandler)
      .buildAsync(port);

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

    class TestRequestHandler extends RequestHandler<JsonResponse> {
      constructor() {
        super();
        this.method("post");
      }
      handle(context: HttpContext): JsonResponse {
        const body = context.request.getBody<TestBody>();
        return new JsonResponse(body, {
          status: StatusCodes.created,
        });
      }
    }

    const expectedResponse: TestBody = {
      email: "example@address.com",
      password: "123456",
    };

    server = await new AppBuilder()
      .useJson()
      .useHttpContext()
      .useRequestHandler(TestRequestHandler)
      .buildAsync(port);

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

  it(`An OnBefore Middleware can intercept the request headers`, async () => {
    // Arrange
    const path = "path/to/authorized/resource";
    const headerKey = "authorization";
    const secretKey = "superSecretKey";

    class TestRequestHandler extends RequestHandler<string> {
      constructor() {
        super();
        this.method("post")
          .path(`/${path}`)
          .onBefore(
            new AnonymousMiddleware((req, res, next) => {
              const token = req.headers[headerKey];
              return token !== secretKey ? res.status(StatusCodes.unauthorized).send() : next();
            })
          );
      }
      handle(context: HttpContext): string {
        return context.request.headers[headerKey] as string;
      }
    }

    server = await new AppBuilder()
      .useJson()
      .useHttpContext()
      .useRequestHandler(TestRequestHandler)
      .buildAsync(port);

    // Act
    const unauthorizedResponse = await fetch(`${serverAddress}/${path}`, {
      method: "post",
    });

    const customHeaders: any = {};
    customHeaders[headerKey] = secretKey;
    const authorizedResponse = await fetch(`${serverAddress}/${path}`, {
      method: "post",
      headers: { ...customHeaders },
    });

    // Assert
    expect(unauthorizedResponse.status).toBe(StatusCodes.unauthorized);
    expect(authorizedResponse.status).toBe(StatusCodes.ok);
    expect(authorizedResponse.text()).resolves.toEqual(secretKey);
  });
});
