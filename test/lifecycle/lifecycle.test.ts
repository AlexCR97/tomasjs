import "reflect-metadata";
import { afterEach, describe, expect, it } from "@jest/globals";
import { AppBuilder } from "../../src/builder";
import { tryCloseServerAsync } from "../utils/server";
import { endpoint, Endpoint, path } from "../../src/endpoints";
import { HttpContext, StatusCodes } from "../../src/core";
import { OkResponse } from "../../src/responses/status-codes";
import fetch from "node-fetch";
import { postConstruct } from "inversify";

describe("lifecycle", () => {
  const port = 3042;
  const serverAddress = `http://localhost:${port}`;
  let server: any; // TODO Set http.Server type

  beforeEach(async () => {
    await tryCloseServerAsync(server);
  });

  afterEach(async () => {
    await tryCloseServerAsync(server);
  });

  it(`Test`, async () => {
    @endpoint()
    @path("resource-1")
    class TestEndpoint1 implements Endpoint {
      @postConstruct()
      onPostConstruct() {
        console.log("post construct 1!");
      }

      handle(context: HttpContext) {
        console.log("handle 1!");
        return new OkResponse();
      }
    }

    @endpoint()
    @path("resource-2")
    class TestEndpoint2 implements Endpoint {
      @postConstruct()
      onPostConstruct() {
        console.log("post construct 2!");
      }

      handle(context: HttpContext) {
        console.log("handle 2!");
        return new OkResponse();
      }
    }

    server = await new AppBuilder()
      .useEndpoint(TestEndpoint1)
      .useEndpoint(TestEndpoint2)
      .buildAsync(port);

    const resource1Response1 = await fetch(`${serverAddress}/resource-1`);
    expect(resource1Response1.status).toBe(StatusCodes.ok);

    const resource2Response1 = await fetch(`${serverAddress}/resource-2`);
    expect(resource2Response1.status).toBe(StatusCodes.ok);

    const resource1Response2 = await fetch(`${serverAddress}/resource-1`);
    expect(resource1Response2.status).toBe(StatusCodes.ok);

    const resource2Response2 = await fetch(`${serverAddress}/resource-2`);
    expect(resource2Response2.status).toBe(StatusCodes.ok);
  });
});
