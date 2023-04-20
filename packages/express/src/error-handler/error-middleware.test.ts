import "reflect-metadata";
import "express-async-errors";
import fetch from "node-fetch";
import { afterEach, describe, it } from "@jest/globals";
import { tryCloseServerAsync } from "../../test/test-utils/server";
import { tick } from "../../test/test-utils/time";
import { AppBuilder } from "../builder";
import { HttpContext, StatusCodes } from "../core";
import { StatusCodeError } from "../../src/core/errors";
import { AnonymousEndpoint } from "../endpoints";
import { ErrorHandler, errorHandler, TomasErrorHandler } from ".";
import { JsonResponse, PlainTextResponse } from "../responses";
import { NextFunction } from "express";

describe("error-handler", () => {
  const port = 3036;
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

  it(`An ErrorHandlerFunction can handle uncaught errors with the default express handler when passing the error to the "next" function`, async () => {
    // Arrange
    server = await new AppBuilder()
      .useEndpoint(
        new AnonymousEndpoint("get", "/", (context: HttpContext) => {
          throw new Error("Unhandled error!");
        })
      )
      .useErrorHandler((err: any, context: HttpContext, next: NextFunction) => {
        next(err);
      })
      .buildAsync(port);

    // Act/Assert
    const response = await fetch(`${serverAddress}`);
    expect(response.status).toBe(StatusCodes.internalServerError);
  });

  it(`An ErrorHandlerFunction can handle uncaught errors with a custom handler`, async () => {
    // Arrange
    const errorMessage = "Error caught with custom handler!";
    const errorStatusCode = StatusCodes.badRequest;

    server = await new AppBuilder()
      .useEndpoint(
        new AnonymousEndpoint("get", "/", (context: HttpContext) => {
          throw new Error("Unhandled error!");
        })
      )
      .useErrorHandler((err: any, context: HttpContext, next: NextFunction) => {
        context.respond(new PlainTextResponse(errorMessage, { status: errorStatusCode }));
      })
      .buildAsync(port);

    // Act/Assert
    const response = await fetch(`${serverAddress}`);
    expect(response.status).toBe(errorStatusCode);
    expect(response.text()).resolves.toEqual(errorMessage);
  });

  it(`A custom ErrorMiddleware constructor can handle uncaught errors`, async () => {
    @errorHandler()
    class CustomErrorHandler implements ErrorHandler {
      catch(err: any, context: HttpContext, next: NextFunction): void | Promise<void> {
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
      }
    }

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
      .useErrorHandler(CustomErrorHandler)
      .buildAsync(port);

    // Act/Assert
    const badRequestResponse = await fetch(`${serverAddress}/bad-request`);
    expect(badRequestResponse.status).toBe(StatusCodes.badRequest);

    const notFoundResponse = await fetch(`${serverAddress}/not-found`);
    expect(notFoundResponse.status).toBe(StatusCodes.notFound);
  });

  it(`The ${TomasErrorHandler.name} can handle uncaught errors with default behavior`, async () => {
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
      .buildAsync(port);

    // Act/Assert
    const badRequestResponse = await fetch(`${serverAddress}/bad-request`);
    expect(badRequestResponse.status).toBe(StatusCodes.badRequest);

    const badRequestResponseJson = await badRequestResponse.json();
    expect(badRequestResponseJson?.message).toEqual(
      `An error occurred with status code ${StatusCodes.badRequest}`
    );

    const notFoundResponse = await fetch(`${serverAddress}/not-found`);
    expect(notFoundResponse.status).toBe(StatusCodes.notFound);

    const notFoundResponseJson = await notFoundResponse.json();
    expect(notFoundResponseJson?.message).toEqual(
      `An error occurred with status code ${StatusCodes.notFound}`
    );
  });
});
