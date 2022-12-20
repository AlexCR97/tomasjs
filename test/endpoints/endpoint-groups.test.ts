import "reflect-metadata";
import { afterEach, describe, it } from "@jest/globals";
import { tryCloseServerAsync } from "../utils/server";
import { AppBuilder } from "../../src/builder";
import { tick } from "../utils/time";
import { HttpContext, StatusCodes } from "../../src/core";
import fetch from "node-fetch";
import { AnonymousEndpoint, EndpointGroup } from "../../src/endpoints";
import { AnonymousMiddleware } from "../../src/middleware";
import { OkResponse, UnauthorizedResponse } from "../../src/responses/status-codes";

describe("endpoint-groups", () => {
  const port = 3034;
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

  it(`An ${EndpointGroup.name} with a base path works`, async () => {
    // Arrange
    const basePath = "base-path/to/resources";
    const resourceDefaultPath = "/";
    const resourcePath1 = "resource-1";
    const resourcePath2 = "resource-2";

    server = await new AppBuilder()
      .useEndpointGroup((endpoints) =>
        endpoints
          .basePath(basePath)
          .useEndpoint(
            new AnonymousEndpoint("get", resourceDefaultPath, (context: HttpContext) => {
              return new OkResponse();
            })
          )
          .useEndpoint(
            new AnonymousEndpoint("get", resourcePath1, (context: HttpContext) => {
              return new OkResponse();
            })
          )
          .useEndpoint(
            new AnonymousEndpoint("get", resourcePath2, (context: HttpContext) => {
              return new OkResponse();
            })
          )
      )
      .buildAsync(port);

    // Act/Assert
    const responseDefaultPath = await fetch(`${serverAddress}/${basePath}/${resourceDefaultPath}`);
    expect(responseDefaultPath.status).toEqual(StatusCodes.ok);

    const responseResource1 = await fetch(`${serverAddress}/${basePath}/${resourcePath1}`);
    expect(responseResource1.status).toEqual(StatusCodes.ok);

    const responseResource2 = await fetch(`${serverAddress}/${basePath}/${resourcePath2}`);
    expect(responseResource2.status).toEqual(StatusCodes.ok);
  });

  it(`The OnBefore Middlewares work`, async () => {
    // Arrange
    const basePath = "base-path";
    const resourcePath1 = "resource-1";
    const resourcePath2 = "resource-2";
    const headerKey = "authorization";
    const secretKey = "superSecretKey";

    server = await new AppBuilder()
      .useEndpointGroup((endpoints) =>
        endpoints
          .basePath(basePath)
          .onBefore(
            new AnonymousMiddleware((context: HttpContext, next) => {
              const token = context.request.headers[headerKey];

              if (token !== secretKey) {
                context.respond(new UnauthorizedResponse());
                return;
              }

              next();
            })
          )
          .useEndpoint(
            new AnonymousEndpoint("post", "/", (context: HttpContext) => {
              return context.request.headers[headerKey];
            })
          )
          .useEndpoint(
            new AnonymousEndpoint("post", resourcePath1, (context: HttpContext) => {
              return context.request.headers[headerKey];
            })
          )
          .useEndpoint(
            new AnonymousEndpoint("post", resourcePath2, (context: HttpContext) => {
              return context.request.headers[headerKey];
            })
          )
      )
      .buildAsync(port);

    // Act/Assert

    const unauthorizedResponse = await fetch(`${serverAddress}/${basePath}`, {
      method: "post",
    });
    expect(unauthorizedResponse.status).toBe(StatusCodes.unauthorized);

    const customHeaders: any = {};
    customHeaders[headerKey] = secretKey;

    const authorizedResponse1 = await fetch(`${serverAddress}/${basePath}/${resourcePath1}`, {
      method: "post",
      headers: { ...customHeaders },
    });
    expect(authorizedResponse1.status).toBe(StatusCodes.ok);
    expect(authorizedResponse1.text()).resolves.toEqual(secretKey);

    const authorizedResponse2 = await fetch(`${serverAddress}/${basePath}/${resourcePath2}`, {
      method: "post",
      headers: { ...customHeaders },
    });
    expect(authorizedResponse2.status).toBe(StatusCodes.ok);
    expect(authorizedResponse2.text()).resolves.toEqual(secretKey);
  });
});
