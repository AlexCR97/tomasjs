import "reflect-metadata";
import "express-async-errors";
import { afterEach, describe, it } from "@jest/globals";
import { tryCloseServerAsync } from "../utils/server";
import { AppBuilder } from "../../src/builder";
import { tick } from "../utils/time";
import { HttpContext, StatusCodes } from "../../src/core";
import { StatusCodeError } from "../../src/core/errors";
import fetch from "node-fetch";
import { AnonymousEndpoint } from "../../src/endpoints";
import { AnonymousErrorMiddleware, ErrorMiddleware } from "../../src/middleware";
import { JsonResponse, PlainTextResponse } from "../../src/responses";

describe("error-middleware", () => {
  const port = 3036;
  const serverAddress = `http://localhost:${port}`;
  const serverTeardownOffsetMilliseconds = 50;
  let server: any; // TODO Set http.Server type

  beforeEach(async () => {
    await tick(serverTeardownOffsetMilliseconds);
    await tryCloseServerAsync(server);
  });

  afterEach(async () => {
    await tick(serverTeardownOffsetMilliseconds);
    await tryCloseServerAsync(server);
  });

  it(`An ${AnonymousErrorMiddleware.name} can handle uncaught errors with the default express handler when passing the error to the "next" function`, async () => {
    // Arrange
    server = await new AppBuilder()
      .useEndpoint(
        new AnonymousEndpoint("get", "/", (context: HttpContext) => {
          throw new Error("Unhandled error!");
        })
      )
      .useErrorMiddleware(
        new AnonymousErrorMiddleware((err, context, next) => {
          next(err);
        })
      )
      .buildAsync(port);

    // Act/Assert
    const response = await fetch(`${serverAddress}`);
    expect(response.status).toBe(StatusCodes.internalServerError);
  });

  it(`An ${AnonymousErrorMiddleware.name} can handle uncaught errors with a custom handler`, async () => {
    // Arrange
    const errorMessage = "Error caught with custom handler!";
    const errorStatusCode = StatusCodes.badRequest;

    server = await new AppBuilder()
      .useEndpoint(
        new AnonymousEndpoint("get", "/", (context: HttpContext) => {
          throw new Error("Unhandled error!");
        })
      )
      .useErrorMiddleware(
        new AnonymousErrorMiddleware((err, context: HttpContext, next) => {
          context.respond(new PlainTextResponse(errorMessage, { status: errorStatusCode }));
        })
      )
      .buildAsync(port);

    // Act/Assert
    const response = await fetch(`${serverAddress}`);
    expect(response.status).toBe(errorStatusCode);
    expect(response.text()).resolves.toEqual(errorMessage);
  });

  it(`An ${ErrorMiddleware.name} constructor can handle uncaught errors`, async () => {
    // Arrange
    server = await new AppBuilder()
      .useEndpoint(
        new AnonymousEndpoint("get", "/bad-request", (context: HttpContext) => {
          throw new StatusCodeError(StatusCodes.badRequest);
        })
      )
      .useEndpoint(
        new AnonymousEndpoint("get", "/not-found", (context: HttpContext) => {
          throw new StatusCodeError(StatusCodes.notFound);
        })
      )
      .useErrorMiddleware(
        new AnonymousErrorMiddleware((err, context: HttpContext, next) => {
          if (err instanceof StatusCodeError) {
            return context.respond(
              new JsonResponse(
                {
                  status: err.status,
                  message: err.message,
                },
                { status: err.status }
              )
            );
          }

          return next(err);
        })
      )
      .buildAsync(port);

    // Act/Assert
    const badRequestResponse = await fetch(`${serverAddress}/bad-request`);
    const badRequestResponseText = await badRequestResponse.json();
    console.log("badRequestResponseText", badRequestResponseText);
    expect(badRequestResponse.status).toBe(StatusCodes.badRequest);

    const notFoundResponse = await fetch(`${serverAddress}/not-found`);
    const notFoundResponseText = await notFoundResponse.json();
    console.log("notFoundResponseText", notFoundResponseText);
    expect(notFoundResponse.status).toBe(StatusCodes.notFound);
  });
});
