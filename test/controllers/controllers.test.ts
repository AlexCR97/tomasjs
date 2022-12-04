import "reflect-metadata";
import { afterEach, describe, it } from "@jest/globals";
import { tryCloseServerAsync } from "../utils/server";
import { AppBuilder } from "../../src/builder";
import { Controller } from "../../src/controllers";
import { HttpContext, StatusCodes } from "../../src/core";
import { environment } from "../environment";
import fetch from "node-fetch";
import { NextFunction, Request, Response } from "express";
import { AnonymousMiddleware, Middleware } from "../../src/middleware";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";
import { tick } from "../utils/time";
import { StatusCodeResponse } from "../../src/responses";

describe("AppBuilder", () => {
  let server: any; // TODO Set http.Server type
  const serverAddress = `http://localhost:${environment.api.port}`;
  const serverTeardownOffsetMilliseconds = 100;

  beforeEach(async () => {
    await tick(serverTeardownOffsetMilliseconds);
    await tryCloseServerAsync(server);
  });

  afterEach(async () => {
    await tick(serverTeardownOffsetMilliseconds);
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

  it('Controller level "onBefore" with Middleware instance works', async () => {
    // Arrange
    class TestController extends Controller {
      constructor() {
        super();
        this.onBefore(new OnBeforeMiddleware());
        this.get("/", (context: HttpContext) => {
          return context.response.getHeader(OnBeforeMiddleware.headerKey);
        });
      }
    }

    server = await new AppBuilder().useController(TestController).buildAsync(environment.api.port);

    // Act
    const response = await fetch(serverAddress);
    const responseText = await response.text();
    const responseHeaderValue = response.headers.get(OnBeforeMiddleware.headerKey);

    // Assert
    expect(responseText).toEqual(OnBeforeMiddleware.headerValue);
    expect(responseHeaderValue).toEqual(OnBeforeMiddleware.headerValue);
  });

  it('Controller level "onBefore" with Middleware constructor works', async () => {
    // Arrange
    class TestController extends Controller {
      constructor() {
        super();
        this.onBefore(OnBeforeMiddleware);
        this.get("/", (context: HttpContext) => {
          return context.response.getHeader(OnBeforeMiddleware.headerKey);
        });
      }
    }

    server = await new AppBuilder().useController(TestController).buildAsync(environment.api.port);

    // Act
    const response = await fetch(serverAddress);
    const responseText = await response.text();
    const responseHeaderValue = response.headers.get(OnBeforeMiddleware.headerKey);

    // Assert
    expect(responseText).toEqual(OnBeforeMiddleware.headerValue);
    expect(responseHeaderValue).toEqual(OnBeforeMiddleware.headerValue);
  });

  it('Controller level "onBefore" with AnonymousMiddleware works', async () => {
    // Arrange
    class TestController extends Controller {
      constructor() {
        super();
        this.onBefore(
          new AnonymousMiddleware((req, res, next) => {
            res.setHeader(OnBeforeMiddleware.headerKey, OnBeforeMiddleware.headerValue);
            next();
          })
        );
        this.get("/", (context: HttpContext) => {
          return context.response.getHeader(OnBeforeMiddleware.headerKey);
        });
      }
    }

    server = await new AppBuilder().useController(TestController).buildAsync(environment.api.port);

    // Act
    const response = await fetch(serverAddress);
    const responseText = await response.text();
    const responseHeaderValue = response.headers.get(OnBeforeMiddleware.headerKey);

    // Assert
    expect(responseText).toEqual(OnBeforeMiddleware.headerValue);
    expect(responseHeaderValue).toEqual(OnBeforeMiddleware.headerValue);
  });

  it('Controller level "onBefore" with multiple AnonymousMiddleware works', async () => {
    // Arrange
    interface TestHeader {
      key: string;
      value: string;
    }

    const expectedHeaders: TestHeader[] = [
      {
        key: "test-header-1",
        value: "test-value-1",
      },
      {
        key: "test-header-2",
        value: "test-value-2",
      },
      {
        key: "test-header-3",
        value: "test-value-3",
      },
    ];

    class TestController extends Controller {
      constructor() {
        super();

        expectedHeaders.forEach((header) => {
          this.onBefore(
            new AnonymousMiddleware((req, res, next) => {
              res.setHeader(header.key, header.value);
              next();
            })
          );
        });

        this.get("/", () => new StatusCodeResponse(StatusCodes.ok));
      }
    }

    server = await new AppBuilder().useController(TestController).buildAsync(environment.api.port);

    // Act
    const response = await fetch(serverAddress);

    // Assert
    expect(response.status).toBe(StatusCodes.ok);

    for (const header of expectedHeaders) {
      expect(response.headers.get(header.key)).toEqual(header.value);
    }
  });
});

class OnBeforeMiddleware extends Middleware {
  static headerKey = "on-before-middleware";
  static headerValue = "on-before-middleware-value";

  handle(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>,
    next: NextFunction
  ): void {
    res.setHeader(OnBeforeMiddleware.headerKey, OnBeforeMiddleware.headerValue);
    next();
  }
}
