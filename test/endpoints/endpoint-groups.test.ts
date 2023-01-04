import "reflect-metadata";
import { afterEach, describe, it } from "@jest/globals";
import { tryCloseServerAsync } from "../utils/server";
import { TomasAppBuilder } from "../../src/builder";
import { tick } from "../utils/time";
import { HttpContext, StatusCodes } from "../../src/core";
import fetch from "node-fetch";
import { AnonymousEndpoint, EndpointGroup } from "../../src/endpoints";
import { AnonymousMiddleware } from "../../src/middleware";
import { OkResponse, UnauthorizedResponse } from "../../src/responses/status-codes";

describe("endpoint-groups", () => {
  const port = 3034;
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

  it(`An ${EndpointGroup.name} with a base path works`, async () => {
    // Arrange
    const basePath = "base-path/to/resources";
    const resourcePath1 = "resource-1";
    const resourcePath2 = "resource-2";

    server = await new TomasAppBuilder()
      .useEndpointGroup((endpoints) =>
        endpoints
          .useBasePath(basePath)
          .useEndpoint(
            new AnonymousEndpoint("get", "/", (context: HttpContext) => {
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
    const defaultPath = `${serverAddress}/${basePath}`;
    const responseDefaultPath = await fetch(defaultPath);
    expect(responseDefaultPath.status).toEqual(StatusCodes.ok);

    const resource1Path = `${serverAddress}/${basePath}/${resourcePath1}`;
    const responseResource1 = await fetch(resource1Path);
    expect(responseResource1.status).toEqual(StatusCodes.ok);

    const resource2Path = `${serverAddress}/${basePath}/${resourcePath2}`;
    const responseResource2 = await fetch(resource2Path);
    expect(responseResource2.status).toEqual(StatusCodes.ok);
  });

  it(`An ${EndpointGroup.name} can use a Middleware`, async () => {
    // Arrange
    const basePath = "base-path";
    const resourcePath1 = "resource-1";
    const resourcePath2 = "resource-2";
    const headerKey = "authorization";
    const secretKey = "superSecretKey";

    server = await new TomasAppBuilder()
      .useEndpointGroup((endpoints) =>
        endpoints
          .useBasePath(basePath)
          .useMiddleware(
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
