import "reflect-metadata";
import "express-async-errors";
import fetch from "node-fetch";
import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { AppBuilder } from "../builder";
import { HttpContext, statusCodes } from "../core";
import { AnonymousEndpoint } from "../endpoints";
import { ErrorHandler } from "./ErrorHandler";
import { errorHandler } from "./@errorHandler";
import { TomasErrorHandler } from "./TomasErrorHandler";
import { JsonResponse, PlainTextResponse } from "../responses";
import { NextFunction } from "express";
import { tick, tryCloseServerAsync } from "../tests/utils";
import { StatusCodeError } from "../errors";

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
    expect(response.status).toBe(statusCodes.internalServerError);
  });

  it(`An ErrorHandlerFunction can handle uncaught errors with a custom handler`, async () => {
    // Arrange
    const errorMessage = "Error caught with custom handler!";
    const errorStatusCode = statusCodes.badRequest;

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
    //@ts-ignore: Fix decorators not working in test files
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
          throw new StatusCodeError(statusCodes.badRequest);
        })
      )
      .useEndpoint(
        new AnonymousEndpoint("get", "/not-found", (context: HttpContext) => {
          throw new StatusCodeError(statusCodes.notFound);
        })
      )
      .useErrorHandler(CustomErrorHandler)
      .buildAsync(port);

    // Act/Assert
    const badRequestResponse = await fetch(`${serverAddress}/bad-request`);
    expect(badRequestResponse.status).toBe(statusCodes.badRequest);

    const notFoundResponse = await fetch(`${serverAddress}/not-found`);
    expect(notFoundResponse.status).toBe(statusCodes.notFound);
  });

  it(`The ${TomasErrorHandler.name} can handle uncaught errors with default behavior`, async () => {
    // Arrange
    server = await new AppBuilder()
      .useEndpoint(
        new AnonymousEndpoint("get", "/bad-request", (context: HttpContext) => {
          throw new StatusCodeError(statusCodes.badRequest);
        })
      )
      .useEndpoint(
        new AnonymousEndpoint("get", "/not-found", (context: HttpContext) => {
          throw new StatusCodeError(statusCodes.notFound);
        })
      )
      .buildAsync(port);

    // Act/Assert
    const badRequestResponse = await fetch(`${serverAddress}/bad-request`);
    expect(badRequestResponse.status).toBe(statusCodes.badRequest);

    const badRequestResponseJson = await badRequestResponse.json();
    expect(badRequestResponseJson?.message).toEqual(
      `An error occurred with status code ${statusCodes.badRequest}`
    );

    const notFoundResponse = await fetch(`${serverAddress}/not-found`);
    expect(notFoundResponse.status).toBe(statusCodes.notFound);

    const notFoundResponseJson = await notFoundResponse.json();
    expect(notFoundResponseJson?.message).toEqual(
      `An error occurred with status code ${statusCodes.notFound}`
    );
  });
});
