import "reflect-metadata";
import fetch from "node-fetch";
import { afterEach, describe, it } from "@jest/globals";
import { tryCloseServerAsync } from "../utils/server";
import { tick } from "../utils/time";
import { AppBuilder } from "../../src/builder";
import { HttpContext, HttpContextAccessor, inHttp, StatusCodes } from "../../src/core";
import { IEndpoint, endpoint, path } from "../../src/endpoints";
import { OkResponse } from "../../src/responses/status-codes";
import { PlainTextResponse } from "../../src/responses";
import { container, inject } from "tsyringe";

describe("endpoints-new", () => {
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

  it.skip(`An Endpoint instance works`, async () => {
    // Arrange
    @endpoint()
    class TestEndpoint implements IEndpoint {
      handle() {
        return new OkResponse();
      }
    }

    server = await new AppBuilder().useEndpointx(new TestEndpoint()).buildAsync(port);

    // Act
    const response = await fetch(serverAddress);

    // Assert
    expect(response.status).toEqual(StatusCodes.ok);
  });

  it.skip(`An Endpoint constructor works`, async () => {
    // Arrange
    @endpoint()
    class TestEndpoint implements IEndpoint {
      handle() {
        return new OkResponse();
      }
    }

    server = await new AppBuilder().useEndpointx(TestEndpoint).buildAsync(port);

    // Act
    const response = await fetch(serverAddress);

    // Assert
    expect(response.status).toEqual(StatusCodes.ok);
  });

  it.skip(`The HttpMethod param in the ${endpoint.name} decorator works`, async () => {
    // Arrange
    @endpoint("post")
    class TestEndpoint implements IEndpoint {
      handle() {
        return new OkResponse();
      }
    }

    server = await new AppBuilder().useEndpointx(TestEndpoint).buildAsync(port);

    // Act
    const response = await fetch(serverAddress, {
      method: "post",
    });

    // Assert
    expect(response.status).toEqual(StatusCodes.ok);
  });

  it.skip(`The ${path.name} decorator maps the endpoint path`, async () => {
    // Arrange
    const customPath = "custom/path/to/resource";

    @endpoint("put")
    @path(customPath)
    class TestEndpoint implements IEndpoint {
      handle() {
        return new OkResponse();
      }
    }

    server = await new AppBuilder().useEndpointx(TestEndpoint).buildAsync(port);

    // Act
    const response = await fetch(`${serverAddress}/${customPath}`, {
      method: "put",
    });

    // Assert
    expect(response.status).toEqual(StatusCodes.ok);
  });

  it(`The ${inHttp.name} decorator injects the ${HttpContext.name} class`, async () => {
    // Arrange
    const expectedResponse = "true";

    @endpoint()
    class TestEndpoint implements IEndpoint {
      constructor(
        @inject(HttpContextAccessor) private readonly httpContextAccessor: HttpContextAccessor
      ) {
        console.log("httpContextAccessor", httpContextAccessor);
      }

      handle() {
        console.log("handler httpContextAccessor", this.httpContextAccessor);
        const htpc = container.resolve(HttpContextAccessor);
        console.log("htpc", htpc);
        const hc = htpc.httpContext;
        console.log("hc", hc);

        const context = this.httpContextAccessor?.httpContext;
        console.log("handler context", context);

        const result = context !== undefined && context instanceof HttpContext;
        return new PlainTextResponse(`${result}`);
      }
    }

    container.register(TestEndpoint, { useClass: TestEndpoint });

    server = await new AppBuilder().useEndpointx(TestEndpoint).buildAsync(port);

    // Act
    const response = await fetch(serverAddress);

    // Assert
    expect(response.status).toEqual(StatusCodes.ok);
    expect(response.text()).resolves.toEqual(expectedResponse);
  });
});
