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

describe("RequestHandlers", () => {
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
      new AppBuilder().useRequestHandler("get", "/", TestRequestHandler);
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
      new AppBuilder().useHttpContext().useRequestHandler("get", "/", TestRequestHandler);
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
      .useRequestHandler("get", "/", new TestRequestHandler())
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
      .useRequestHandler("get", "/", TestRequestHandler)
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
        "get",
        "/",
        new AnonymousRequestHandler(() => {
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
      handle(context: HttpContext): StatusCodeResponse {
        return new StatusCodeResponse(StatusCodeRequestHandler.expectedStatusCode);
      }
    }

    class PlainTextRequestHandler extends RequestHandler<PlainTextResponse> {
      static path = "plain-text";
      static expectedPlainText = "plain text test";
      handle(context: HttpContext): PlainTextResponse {
        return new PlainTextResponse(PlainTextRequestHandler.expectedPlainText);
      }
    }

    class JsonRequestHandler extends RequestHandler<JsonResponse> {
      static path = "json";
      static expectedJson = { key: "test-key", value: "test-value" };
      handle(context: HttpContext): JsonResponse {
        return new JsonResponse(JsonRequestHandler.expectedJson);
      }
    }

    server = await new AppBuilder()
      .useHttpContext()
      .useRequestHandler("get", `/${StatusCodeRequestHandler.path}`, StatusCodeRequestHandler)
      .useRequestHandler("get", `/${PlainTextRequestHandler.path}`, PlainTextRequestHandler)
      .useRequestHandler("get", `/${JsonRequestHandler.path}`, JsonRequestHandler)
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

  it(`The request body can be extracted as json from the HttpContext if the "useJson" method was used first`, async () => {
    // Arrange
    interface TestBody {
      email: string;
      password: string;
    }

    class TestRequestHandler extends RequestHandler<JsonResponse> {
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
      .useRequestHandler("post", "/", TestRequestHandler)
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
});
