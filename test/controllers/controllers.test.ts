import "reflect-metadata";
import { afterEach, describe, it } from "@jest/globals";
import { tryCloseServerAsync } from "../utils/server";
import { AppBuilder } from "../../src/builder";
import { Controller } from "../../src/controllers";
import { RequestContext, StatusCodes } from "../../src/core";
import { environment } from "../environment";
import fetch from "node-fetch";
import { NextFunction, Request, Response } from "express";

describe("AppBuilder", () => {
  let server: any; // TODO Set http.Server type
  const serverAddress = `http://localhost:${environment.api.port}`;

  beforeEach(async () => {
    await tryCloseServerAsync(server);
  });

  afterEach(async () => {
    await tryCloseServerAsync(server);
  });

  it("A Controller instance works", async () => {
    // Arrange
    const expectedResponse = "Hello Controller instance!";

    class TestController extends Controller {
      constructor() {
        super();
        this.get("/", () => expectedResponse);
      }
    }

    server = await new AppBuilder()
      .useController(new TestController())
      .buildAsync(environment.api.port);

    // Act
    const response = await fetch(serverAddress);
    const responseText = await response.text();

    // Assert
    expect(responseText).toEqual(expectedResponse);
  });

  it("A Controller constructor works", async () => {
    // Arrange
    const expectedResponse = "Hello Controller constructor!";

    class TestController extends Controller {
      constructor() {
        super();
        this.get("/", () => expectedResponse);
      }
    }

    server = await new AppBuilder().useController(TestController).buildAsync(environment.api.port);

    // Act
    const response = await fetch(serverAddress);
    const responseText = await response.text();

    // Assert
    expect(responseText).toEqual(expectedResponse);
  });

  it("Basic CRUD HTTP methods are supported", async () => {
    // Arrange
    const expectedResponse = "http method works!";

    class TestController extends Controller {
      constructor() {
        super();
        this.get("/", () => expectedResponse)
          .post("/", () => expectedResponse)
          .put("/", () => expectedResponse)
          .patch("/", () => expectedResponse)
          .delete("/", () => expectedResponse);
      }
    }

    server = await new AppBuilder().useController(TestController).buildAsync(environment.api.port);

    // Act/Assert GET
    const getResponse = await fetch(serverAddress, { method: "get" });
    expect(getResponse.status).toBe(StatusCodes.ok);
    const getResponseText = await getResponse.text();
    expect(getResponseText).toEqual(expectedResponse);

    // Act/Assert POST
    const postResponse = await fetch(serverAddress, { method: "post" });
    expect(postResponse.status).toBe(StatusCodes.ok);
    const postResponseText = await postResponse.text();
    expect(postResponseText).toEqual(expectedResponse);

    // Act/Assert PUT
    const putResponse = await fetch(serverAddress, { method: "put" });
    expect(putResponse.status).toBe(StatusCodes.ok);
    const putResponseText = await putResponse.text();
    expect(putResponseText).toEqual(expectedResponse);

    // Act/Assert PATCH
    const patchResponse = await fetch(serverAddress, { method: "patch" });
    expect(patchResponse.status).toBe(StatusCodes.ok);
    const patchResponseText = await patchResponse.text();
    expect(patchResponseText).toEqual(expectedResponse);

    // Act/Assert DELETE
    const deleteResponse = await fetch(serverAddress, { method: "delete" });
    expect(deleteResponse.status).toBe(StatusCodes.ok);
    const deleteResponseText = await deleteResponse.text();
    expect(deleteResponseText).toEqual(expectedResponse);
  });

  it("Routing works", async () => {
    // Arrange
    const controllerPath = "path/to/controller";
    const actionPath = "path/to/resource";
    const expectedResponse = "routing works!";

    class TestController extends Controller {
      constructor() {
        super();
        this.route(controllerPath)
          .get("/", () => expectedResponse)
          .get(`/${actionPath}`, () => expectedResponse);
      }
    }

    server = await new AppBuilder().useController(TestController).buildAsync(environment.api.port);

    // Act/Assert - Default action path
    const defaultPathResponse = await fetch(`${serverAddress}/${controllerPath}`);
    const defaultPathResponseText = await defaultPathResponse.text();
    expect(defaultPathResponseText).toEqual(expectedResponse);

    // Act/Assert - Custom action path
    const customPathResponse = await fetch(`${serverAddress}/${controllerPath}/${actionPath}`);
    const customPathResponseText = await customPathResponse.text();
    expect(customPathResponseText).toEqual(expectedResponse);
  });

  // TODO Fix this test
  it("Controller level onBefore ExpressMiddlewareHandler works", async () => {
    // Arrange
    const headerKey = "test-header";
    const headerValue = "test-value";

    class TestController extends Controller {
      constructor() {
        super();

        this.onBefore((req: Request, res: Response, next: NextFunction) => {
          req.headers[headerKey] = headerValue;
          next();
        });

        this.get("/", (context: RequestContext) => context.headers[headerKey]);
      }
    }

    server = await new AppBuilder().useController(TestController).buildAsync(environment.api.port);

    // Act
    const response = await fetch(serverAddress);
    const responseText = await response.text();
    const responseHeaderValue = response.headers.get(headerKey);

    // Assert
    expect(responseText).toEqual(headerValue);
    expect(responseHeaderValue).toEqual(headerValue);
  });
});
