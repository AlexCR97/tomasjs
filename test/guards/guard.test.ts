import "reflect-metadata";
import fetch from "node-fetch";
import { afterEach, beforeEach, describe, it } from "@jest/globals";
import { TomasAppBuilder } from "../../src/builder";
import { HttpContext, StatusCodes } from "../../src/core";
import { AnonymousEndpoint, endpoint, Endpoint, path, useGuard } from "../../src/endpoints";
import { guard, Guard, GuardContext } from "../../src/guards";
import { OkResponse } from "../../src/responses/status-codes";
import { tryCloseServerAsync } from "../utils/server";
import { tick } from "../utils/time";

describe("guards", () => {
  const port = 3040;
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

  it(`A global Guard should allow the request to be processed if returns true`, async () => {
    // Arrange

    @guard()
    class TestGuard implements Guard {
      isAllowed(context: GuardContext): boolean {
        return true;
      }
    }

    @endpoint()
    class TestEndpoint implements Endpoint {
      handle(context: HttpContext) {
        return new OkResponse();
      }
    }

    server = await new TomasAppBuilder()
      .useGuard(TestGuard)
      .useEndpoint(TestEndpoint)
      .buildAsync(port);

    // Act
    const response = await fetch(serverAddress);

    // Assert
    expect(response.status).toEqual(StatusCodes.ok);
  });

  it(`A global Guard should make the server respond with 401 if returns false`, async () => {
    // Arrange

    @guard()
    class TestGuard implements Guard {
      isAllowed(context: GuardContext): boolean {
        return false;
      }
    }

    @endpoint()
    class TestEndpoint implements Endpoint {
      handle(context: HttpContext) {
        return new OkResponse();
      }
    }

    server = await new TomasAppBuilder()
      .useGuard(TestGuard)
      .useEndpoint(TestEndpoint)
      .buildAsync(port);

    // Act
    const response = await fetch(serverAddress);

    // Assert
    expect(response.status).toEqual(StatusCodes.unauthorized);
  });

  it(`A global-level Guard should be applied to all of the endpoints`, async () => {
    // Arrange
    const resource1Path = "resource-1";
    const resource2Path = "resource-2";

    @guard()
    class TestGuard implements Guard {
      isAllowed(context: GuardContext): boolean {
        return false;
      }
    }

    server = await new TomasAppBuilder()
      .useGuard(TestGuard)
      .useEndpoint(
        new AnonymousEndpoint("get", resource1Path, (context: HttpContext) => {
          return new OkResponse();
        })
      )
      .useEndpoint(
        new AnonymousEndpoint("get", resource2Path, (context: HttpContext) => {
          return new OkResponse();
        })
      )
      .buildAsync(port);

    // Act/Assert
    const response1 = await fetch(`${serverAddress}/${resource1Path}`);
    expect(response1.status).toEqual(StatusCodes.unauthorized);

    const response2 = await fetch(`${serverAddress}/${resource2Path}`);
    expect(response2.status).toEqual(StatusCodes.unauthorized);
  });

  it(`A local-level Guard should be applied to only the decorated endpoint`, async () => {
    // Arrange
    const resource1Path = "resource-1";
    const resource2Path = "resource-2";

    @guard()
    class TestGuard implements Guard {
      isAllowed(context: GuardContext): boolean {
        return false;
      }
    }

    @endpoint()
    @path(resource1Path)
    @useGuard(TestGuard)
    class TestEndpoint1 implements Endpoint {
      handle(context: HttpContext) {
        return new OkResponse();
      }
    }

    @endpoint()
    @path(resource2Path)
    class TestEndpoint2 implements Endpoint {
      handle(context: HttpContext) {
        return new OkResponse();
      }
    }

    server = await new TomasAppBuilder()
      .useEndpoint(TestEndpoint1)
      .useEndpoint(TestEndpoint2)
      .buildAsync(port);

    // Act/Assert
    const response1 = await fetch(`${serverAddress}/${resource1Path}`);
    expect(response1.status).toEqual(StatusCodes.unauthorized);

    const response2 = await fetch(`${serverAddress}/${resource2Path}`);
    expect(response2.status).toEqual(StatusCodes.ok);
  });

  it(`An EndpointGroup-level Guard should be applied to only the endpoints defined inside the EndpointGroup`, async () => {
    // Arrange
    const resource1Path = "resource-1";
    const resource2Path = "resource-2";
    const resource3Path = "resource-3";

    @guard()
    class TestGuard implements Guard {
      isAllowed(context: GuardContext): boolean {
        return false;
      }
    }

    @endpoint()
    @path(resource1Path)
    class TestEndpoint1 implements Endpoint {
      handle(context: HttpContext) {
        return new OkResponse();
      }
    }

    @endpoint()
    @path(resource2Path)
    class TestEndpoint2 implements Endpoint {
      handle(context: HttpContext) {
        return new OkResponse();
      }
    }

    @endpoint()
    @path(resource3Path)
    class TestEndpoint3 implements Endpoint {
      handle(context: HttpContext) {
        return new OkResponse();
      }
    }

    server = await new TomasAppBuilder()
      .useEndpointGroup((endpoints) =>
        endpoints.useGuard(TestGuard).useEndpoint(TestEndpoint1).useEndpoint(TestEndpoint2)
      )
      .useEndpoint(TestEndpoint3)
      .buildAsync(port);

    // Act/Assert
    const response1 = await fetch(`${serverAddress}/${resource1Path}`);
    expect(response1.status).toEqual(StatusCodes.unauthorized);

    const response2 = await fetch(`${serverAddress}/${resource2Path}`);
    expect(response2.status).toEqual(StatusCodes.unauthorized);

    const response3 = await fetch(`${serverAddress}/${resource3Path}`);
    expect(response3.status).toEqual(StatusCodes.ok);
  });
});
