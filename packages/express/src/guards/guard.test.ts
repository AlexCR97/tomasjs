import "reflect-metadata";
import fetch from "node-fetch";
import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { AppBuilder } from "../builder";
import { HttpContext, statusCodes } from "../core";
import { AnonymousEndpoint, endpoint, Endpoint, path, useGuard } from "../endpoints";
import { guard } from "./@guard";
import { Guard } from "./Guard";
import { GuardContext } from "./GuardContext";
import { OkResponse } from "../responses/status-codes";
import { tick, tryCloseServerAsync } from "../tests/utils";

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

    //@ts-ignore: Fix decorators not working in test files
    @guard()
    class TestGuard implements Guard {
      isAllowed(context: GuardContext): boolean {
        return true;
      }
    }

    //@ts-ignore: Fix decorators not working in test files
    @endpoint()
    class TestEndpoint implements Endpoint {
      handle(context: HttpContext) {
        return new OkResponse();
      }
    }

    server = await new AppBuilder().useGuard(TestGuard).useEndpoint(TestEndpoint).buildAsync(port);

    // Act
    const response = await fetch(serverAddress);

    // Assert
    expect(response.status).toEqual(statusCodes.ok);
  });

  it(`A global Guard should make the server respond with 401 if returns false`, async () => {
    // Arrange

    //@ts-ignore: Fix decorators not working in test files
    @guard()
    class TestGuard implements Guard {
      isAllowed(context: GuardContext): boolean {
        return false;
      }
    }

    //@ts-ignore: Fix decorators not working in test files
    @endpoint()
    class TestEndpoint implements Endpoint {
      handle(context: HttpContext) {
        return new OkResponse();
      }
    }

    server = await new AppBuilder().useGuard(TestGuard).useEndpoint(TestEndpoint).buildAsync(port);

    // Act
    const response = await fetch(serverAddress);

    // Assert
    expect(response.status).toEqual(statusCodes.unauthorized);
  });

  it(`A global-level Guard should be applied to all of the endpoints`, async () => {
    // Arrange
    const resource1Path = "resource-1";
    const resource2Path = "resource-2";

    //@ts-ignore: Fix decorators not working in test files
    @guard()
    class TestGuard implements Guard {
      isAllowed(context: GuardContext): boolean {
        return false;
      }
    }

    server = await new AppBuilder()
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
    expect(response1.status).toEqual(statusCodes.unauthorized);

    const response2 = await fetch(`${serverAddress}/${resource2Path}`);
    expect(response2.status).toEqual(statusCodes.unauthorized);
  });

  it(`A local-level Guard should be applied to only the decorated endpoint`, async () => {
    // Arrange
    const resource1Path = "resource-1";
    const resource2Path = "resource-2";

    //@ts-ignore: Fix decorators not working in test files
    @guard()
    class TestGuard implements Guard {
      isAllowed(context: GuardContext): boolean {
        return false;
      }
    }

    //@ts-ignore: Fix decorators not working in test files
    @endpoint()
    //@ts-ignore: Fix decorators not working in test files
    @path(resource1Path)
    //@ts-ignore: Fix decorators not working in test files
    @useGuard(TestGuard)
    class TestEndpoint1 implements Endpoint {
      handle(context: HttpContext) {
        return new OkResponse();
      }
    }

    //@ts-ignore: Fix decorators not working in test files
    @endpoint()
    //@ts-ignore: Fix decorators not working in test files
    @path(resource2Path)
    class TestEndpoint2 implements Endpoint {
      handle(context: HttpContext) {
        return new OkResponse();
      }
    }

    server = await new AppBuilder()
      .useEndpoint(TestEndpoint1)
      .useEndpoint(TestEndpoint2)
      .buildAsync(port);

    // Act/Assert
    const response1 = await fetch(`${serverAddress}/${resource1Path}`);
    expect(response1.status).toEqual(statusCodes.unauthorized);

    const response2 = await fetch(`${serverAddress}/${resource2Path}`);
    expect(response2.status).toEqual(statusCodes.ok);
  });

  it(`An EndpointGroup-level Guard should be applied to only the endpoints defined inside the EndpointGroup`, async () => {
    // Arrange
    const resource1Path = "resource-1";
    const resource2Path = "resource-2";
    const resource3Path = "resource-3";

    //@ts-ignore: Fix decorators not working in test files
    @guard()
    class TestGuard implements Guard {
      isAllowed(context: GuardContext): boolean {
        return false;
      }
    }

    //@ts-ignore: Fix decorators not working in test files
    @endpoint()
    //@ts-ignore: Fix decorators not working in test files
    @path(resource1Path)
    class TestEndpoint1 implements Endpoint {
      handle(context: HttpContext) {
        return new OkResponse();
      }
    }

    //@ts-ignore: Fix decorators not working in test files
    @endpoint()
    //@ts-ignore: Fix decorators not working in test files
    @path(resource2Path)
    class TestEndpoint2 implements Endpoint {
      handle(context: HttpContext) {
        return new OkResponse();
      }
    }

    //@ts-ignore: Fix decorators not working in test files
    @endpoint()
    //@ts-ignore: Fix decorators not working in test files
    @path(resource3Path)
    class TestEndpoint3 implements Endpoint {
      handle(context: HttpContext) {
        return new OkResponse();
      }
    }

    server = await new AppBuilder()
      .useEndpointGroup((endpoints) =>
        endpoints.useGuard(TestGuard).useEndpoint(TestEndpoint1).useEndpoint(TestEndpoint2)
      )
      .useEndpoint(TestEndpoint3)
      .buildAsync(port);

    // Act/Assert
    const response1 = await fetch(`${serverAddress}/${resource1Path}`);
    expect(response1.status).toEqual(statusCodes.unauthorized);

    const response2 = await fetch(`${serverAddress}/${resource2Path}`);
    expect(response2.status).toEqual(statusCodes.unauthorized);

    const response3 = await fetch(`${serverAddress}/${resource3Path}`);
    expect(response3.status).toEqual(statusCodes.ok);
  });
});
