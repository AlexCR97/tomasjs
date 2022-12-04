import "reflect-metadata";
import { afterEach, describe, it } from "@jest/globals";
import { tryCloseServerAsync } from "../utils/server";
import { AppBuilder } from "../../src/builder";
import { tick } from "../utils/time";
import { RequestHandler } from "../../src/requests";
import { StatusCodeResponse } from "../../src/responses";
import { HttpContext, StatusCodes } from "../../src/core";
import fetch from "node-fetch";

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
    class TestRequestHandler extends RequestHandler<StatusCodeResponse> {
      handle(context: HttpContext): StatusCodeResponse | Promise<StatusCodeResponse> {
        return new StatusCodeResponse(StatusCodes.ok);
      }
    }

    // Act/Assert
    expect(() => {
      new AppBuilder().useRequestHandler("get", "/", TestRequestHandler);
    }).toThrow();
  });

  it(`The "useRequestHandler" method should work if the "useRequestContext" method was used first`, () => {
    // Arrange
    class TestRequestHandler extends RequestHandler<StatusCodeResponse> {
      handle(context: HttpContext): StatusCodeResponse | Promise<StatusCodeResponse> {
        return new StatusCodeResponse(StatusCodes.ok);
      }
    }

    // Act/Assert
    expect(() => {
      new AppBuilder().useRequestContext().useRequestHandler("get", "/", TestRequestHandler);
    }).not.toThrow();
  });

  it("A RequestHandler constructor works", async () => {
    // Arrange
    class TestRequestHandler extends RequestHandler<StatusCodeResponse> {
      handle(context: HttpContext): StatusCodeResponse | Promise<StatusCodeResponse> {
        return new StatusCodeResponse(StatusCodes.ok);
      }
    }

    server = await new AppBuilder()
      .useRequestContext()
      .useRequestHandler("get", "/", TestRequestHandler)
      .buildAsync(port);

    // Act
    const response = await fetch(serverAddress);

    // Assert
    expect(response.status).toEqual(StatusCodes.ok);
  });
});
