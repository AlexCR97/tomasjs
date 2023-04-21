import "reflect-metadata";
import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { AppBuilder } from "../builder";
import { HttpContext, statusCodes } from "../core";
import fetch from "node-fetch";
import { AnonymousEndpoint } from "./AnonymousEndpoint";
import { EndpointGroup } from "./EndpointGroup";
import { AnonymousMiddleware } from "../middleware";
import { OkResponse, UnauthorizedResponse } from "../responses/status-codes";
import { tick, tryCloseServerAsync } from "../tests/utils";

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

    server = await new AppBuilder()
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
    expect(responseDefaultPath.status).toEqual(statusCodes.ok);

    const resource1Path = `${serverAddress}/${basePath}/${resourcePath1}`;
    const responseResource1 = await fetch(resource1Path);
    expect(responseResource1.status).toEqual(statusCodes.ok);

    const resource2Path = `${serverAddress}/${basePath}/${resourcePath2}`;
    const responseResource2 = await fetch(resource2Path);
    expect(responseResource2.status).toEqual(statusCodes.ok);
  });

  it(`An ${EndpointGroup.name} can use a Middleware`, async () => {
    // Arrange
    const basePath = "base-path";
    const resourcePath1 = "resource-1";
    const resourcePath2 = "resource-2";
    const headerKey = "authorization";
    const secretKey = "superSecretKey";

    server = await new AppBuilder()
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
    expect(unauthorizedResponse.status).toBe(statusCodes.unauthorized);

    const customHeaders: any = {};
    customHeaders[headerKey] = secretKey;

    const authorizedResponse1 = await fetch(`${serverAddress}/${basePath}/${resourcePath1}`, {
      method: "post",
      headers: { ...customHeaders },
    });
    expect(authorizedResponse1.status).toBe(statusCodes.ok);
    expect(authorizedResponse1.text()).resolves.toEqual(secretKey);

    const authorizedResponse2 = await fetch(`${serverAddress}/${basePath}/${resourcePath2}`, {
      method: "post",
      headers: { ...customHeaders },
    });
    expect(authorizedResponse2.status).toBe(statusCodes.ok);
    expect(authorizedResponse2.text()).resolves.toEqual(secretKey);
  });
});
