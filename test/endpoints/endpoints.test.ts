import "reflect-metadata";
import { afterEach, describe, it } from "@jest/globals";
import { tryCloseServerAsync } from "../utils/server";
import { AppBuilder } from "../../src/builder";
import { tick } from "../utils/time";
import { HttpContext, StatusCodes } from "../../src/core";
import fetch from "node-fetch";
import { OkResponse } from "../../src/responses/status-codes";
import { AnonymousEndpoint, Endpoint } from "../../src/endpoints";

describe("Endpoints", () => {
  const port = 3033;
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

  it(`An ${Endpoint.name} instance works`, async () => {
    // Arrange
    class TestEndpoint extends Endpoint {
      handle(context: HttpContext) {
        return new OkResponse();
      }
    }

    server = await new AppBuilder().useEndpoint(new TestEndpoint()).buildAsync(port);

    // Act
    const response = await fetch(serverAddress);

    // Assert
    expect(response.status).toEqual(StatusCodes.ok);
  });

  it(`An ${Endpoint.name} constructor works`, async () => {
    // Arrange
    class TestEndpoint extends Endpoint {
      handle(context: HttpContext): OkResponse {
        return new OkResponse();
      }
    }

    server = await new AppBuilder().useEndpoint(TestEndpoint).buildAsync(port);

    // Act
    const response = await fetch(serverAddress);

    // Assert
    expect(response.status).toEqual(StatusCodes.ok);
  });

  it(`An ${AnonymousEndpoint.name} instance works`, async () => {
    // Arrange

    server = await new AppBuilder()
      .useHttpContext()
      .useEndpoint(
        new AnonymousEndpoint("get", "/", (context) => {
          return new OkResponse();
        })
      )
      .buildAsync(port);

    // Act
    const response = await fetch(serverAddress);

    // Assert
    expect(response.status).toEqual(StatusCodes.ok);
  });
});
