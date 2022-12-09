import "reflect-metadata";
import { afterEach, describe, it } from "@jest/globals";
import { tryCloseServerAsync } from "../utils/server";
import { tick } from "../utils/time";
import { IEndpoint } from "../../src/endpoints/IEndpoint";
import { Context, Endpoint } from "../../src/endpoints/decorators";
import { HttpContext } from "../../src/core";

describe("Endpoint Decorators", () => {
  // const port = 3033;
  // const serverAddress = `http://localhost:${port}`;
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

  it(`The ${Endpoint.name} decorator works`, async () => {
    @Endpoint("get", "/test")
    class TestEndpoint implements IEndpoint {
      handle(@Context() context: HttpContext) {
        throw new Error("Method not implemented.");
      }
    }

    const endpointInstance = new TestEndpoint();
    console.log("endpointInstance", endpointInstance);
  });
});
