import "reflect-metadata";
import { describe, expect, it } from "@jest/globals";
import fetch from "node-fetch";
import { AppBuilder } from "../../dist/builder";
import { HttpContext, StatusCodes } from "../../dist/core";
import { Endpoint } from "../../dist/endpoints";
import { OkResponse } from "../../dist/responses/status-codes";
import { tick } from "../utils/time";
import { tryCloseServerAsync } from "../utils/server";

// The test suite name must be "dist-test" because of npm script "testw-dist"
describe.skip("dist-test", () => {
  const port = 3033;
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

  it("AppBuilder from build works", () => {
    const app = new AppBuilder();
    expect(app).toBeTruthy();
  });

  it("Endpoint from build works", async () => {
    // Arrange
    class TestEndpoint extends Endpoint {
      handle(context: HttpContext) {
        return new OkResponse();
      }
    }

    server = await new AppBuilder().useEndpoint(TestEndpoint).buildAsync(port);

    // Act
    const response = await fetch(serverAddress);

    // Assert
    expect(response.status).toEqual(StatusCodes.ok);
  });
});
