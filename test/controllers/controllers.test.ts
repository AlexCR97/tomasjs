import "reflect-metadata";
import { afterEach, describe, it } from "@jest/globals";
import { tryCloseServerAsync } from "../utils/server";
import { AppBuilder } from "../../src/builder";
import { Controller } from "../../src/controllers";
import { HttpContext, StatusCodes } from "../../src/core";
import fetch from "node-fetch";
import { NextFunction, Request, Response } from "express";
import { AnonymousMiddleware, Middleware } from "../../src/middleware";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";
import { tick } from "../utils/time";
import { JsonResponse, StatusCodeResponse } from "../../src/responses";

describe.skip("Controllers", () => {
  const port = 3031;
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

  it("A Controller instance works", async () => {
    // Arrange
    const expectedResponse = "Hello Controller instance!";

    class TestController extends Controller {
      constructor() {
        super();
        this.get("/", () => expectedResponse);
      }
    }

    server = await new AppBuilder().useController(new TestController()).buildAsync(port);

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

    server = await new AppBuilder().useController(TestController).buildAsync(port);

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

    server = await new AppBuilder().useController(TestController).buildAsync(port);

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

    server = await new AppBuilder().useController(TestController).buildAsync(port);

    // Act/Assert - Default action path
    const defaultPathResponse = await fetch(`${serverAddress}/${controllerPath}`);
    const defaultPathResponseText = await defaultPathResponse.text();
    expect(defaultPathResponseText).toEqual(expectedResponse);

    // Act/Assert - Custom action path
    const customPathResponse = await fetch(`${serverAddress}/${controllerPath}/${actionPath}`);
    const customPathResponseText = await customPathResponse.text();
    expect(customPathResponseText).toEqual(expectedResponse);
  });

  it("The request path can be extracted from the HttpContext", async () => {
    // Arrange
    const controllerRoute = "test";
    const expectedPath = "/path/to/resource";

    class TestController extends Controller {
      constructor() {
        super();
        this.route(controllerRoute).get(
          expectedPath,
          (context: HttpContext) => context.request.path
        );
      }
    }

    server = await new AppBuilder().useController(TestController).buildAsync(port);

    // Act
    const requestUrl = `${serverAddress}/${controllerRoute}${expectedPath}`;
    const response = await fetch(requestUrl);

    // Assert - Custom action path
    expect(response.status).toBe(StatusCodes.ok);
    expect(response.text()).resolves.toEqual(expectedPath);
  });

  it("The request headers can be extracted from the HttpContext", async () => {
    // Arrange
    interface TestHeader {
      key: string;
      value: string;
    }

    const controllerRoute = "test";

    class TestController extends Controller {
      constructor() {
        super();
        this.route(controllerRoute).get("/", (context: HttpContext) => context.request.headers);
      }
    }

    const expectedResponseHeader: TestHeader = {
      key: "test-header-key",
      value: "test-header-value",
    };

    server = await new AppBuilder().useController(TestController).buildAsync(port);

    // Act
    const customHeaders: any = {};
    customHeaders[expectedResponseHeader.key] = expectedResponseHeader.value;

    const requestUrl = `${serverAddress}/${controllerRoute}`;
    const response = await fetch(requestUrl, {
      headers: { ...customHeaders },
    });

    // Assert
    expect(response.status).toBe(StatusCodes.ok);

    const responseJson = await response.json();
    expect(responseJson[expectedResponseHeader.key]).toEqual(expectedResponseHeader.value);
  });

  it("The request params can be extracted from the HttpContext", async () => {
    // Arrange
    const controllerRoute = "test";
    const expectedPath = "users/:id/profile/:profileId";
    const expectedPathValues = {
      id: 123,
      profileId: 246,
    };

    class TestController extends Controller {
      constructor() {
        super();
        this.route(controllerRoute).get(`/${expectedPath}`, (context: HttpContext) => {
          return new JsonResponse({
            id: Number(context.request.params.id),
            profileId: Number(context.request.params.profileId),
          });
        });
      }
    }

    server = await new AppBuilder().useController(TestController).buildAsync(port);

    // Act
    const response = await fetch(
      `${serverAddress}/${controllerRoute}/${expectedPath
        .replace(":id", expectedPathValues.id.toString())
        .replace(":profileId", expectedPathValues.profileId.toString())}`
    );

    // Assert
    expect(response.status).toBe(StatusCodes.ok);
    expect(response.json()).resolves.toEqual(expectedPathValues);
  });

  it("The request query can be extracted from the HttpContext", async () => {
    // Arrange
    const controllerRoute = "test";
    const expectedPath = "users";
    const expectedQueryParams = {
      pageIndex: 3,
      pageSize: 16,
    };

    class TestController extends Controller {
      constructor() {
        super();
        this.route(controllerRoute).get(`/${expectedPath}`, (context: HttpContext) => {
          return new JsonResponse({
            pageIndex: Number(context.request.query.pageIndex),
            pageSize: Number(context.request.query.pageSize),
          });
        });
      }
    }

    server = await new AppBuilder().useController(TestController).buildAsync(port);

    // Act
    const queryParams = new URLSearchParams();
    queryParams.set("pageIndex", "3");
    queryParams.set("pageSize", "16");
    const requestUrl = `${serverAddress}/${controllerRoute}/${expectedPath}?${queryParams.toString()}`;
    const response = await fetch(requestUrl);

    // Assert
    expect(response.status).toBe(StatusCodes.ok);
    expect(response.json()).resolves.toEqual(expectedQueryParams);
  });

  it(`The request body can be extracted as plain text from the HttpContext if the "useText" method was used first`, async () => {
    // Arrange
    const expectedResponse = "Plain text body works!";

    class TestController extends Controller {
      constructor() {
        super();
        this.post("/", (context: HttpContext) => {
          return context.request.body;
        });
      }
    }

    server = await new AppBuilder().useText().useController(TestController).buildAsync(port);

    // Act
    const response = await fetch(serverAddress, {
      method: "post",
      body: expectedResponse,
      headers: { "Content-Type": "text/plain" },
    });

    // Assert
    expect(response.status).toBe(StatusCodes.ok);
    expect(response.text()).resolves.toEqual(expectedResponse);
  });

  it(`The request body can be extracted as json from the HttpContext if the "useJson" method was used first`, async () => {
    // Arrange
    interface TestBody {
      email: string;
      password: string;
    }

    class TestController extends Controller {
      constructor() {
        super();
        this.post("/", (context: HttpContext) => {
          const body = context.request.getBody<TestBody>();
          return new JsonResponse(body, {
            status: StatusCodes.created,
          });
        });
      }
    }

    const expectedResponse: TestBody = {
      email: "example@address.com",
      password: "123456",
    };

    server = await new AppBuilder().useJson().useController(TestController).buildAsync(port);

    // Act
    const response = await fetch(serverAddress, {
      method: "post",
      body: JSON.stringify(expectedResponse),
      headers: { "Content-Type": "application/json" },
    });

    // Assert
    expect(response.status).toBe(StatusCodes.created);
    expect(response.json()).resolves.toEqual(expectedResponse);
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

    server = await new AppBuilder().useController(TestController).buildAsync(port);

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

    server = await new AppBuilder().useController(TestController).buildAsync(port);

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

    server = await new AppBuilder().useController(TestController).buildAsync(port);

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

    server = await new AppBuilder().useController(TestController).buildAsync(port);

    // Act
    const response = await fetch(serverAddress);

    // Assert
    expect(response.status).toBe(StatusCodes.ok);

    for (const header of expectedHeaders) {
      expect(response.headers.get(header.key)).toEqual(header.value);
    }
  });

  it("Action level Middlewares work", async () => {
    // Arrange
    interface TestHeader {
      key: string;
      value: string;
    }

    const controllerHeader: TestHeader = {
      key: "header-from-controller",
      value: "value-from-controller",
    };

    const actionHeader1: TestHeader = {
      key: "header-from-action-1",
      value: "value-from-action-1",
    };

    const actionHeader2: TestHeader = {
      key: "header-from-action-2",
      value: "value-from-action-2",
    };

    class TestController extends Controller {
      constructor() {
        super();

        this.onBefore(
          new AnonymousMiddleware((req, res, next) => {
            req.headers[controllerHeader.key] = controllerHeader.value;
            res.setHeader(controllerHeader.key, controllerHeader.value);
            next();
          })
        );

        this.get(
          "/",
          new AnonymousMiddleware((req, res, next) => {
            req.headers[actionHeader1.key] = actionHeader1.value;
            res.setHeader(actionHeader1.key, actionHeader1.value);
            next();
          }),
          new AnonymousMiddleware((req, res, next) => {
            req.headers[actionHeader2.key] = actionHeader2.value;
            res.setHeader(actionHeader2.key, actionHeader2.value);
            next();
          }),
          (context: HttpContext) => {
            return new JsonResponse(context.request.headers);
          }
        );
      }
    }

    server = await new AppBuilder().useController(TestController).buildAsync(port);

    // Act
    const response = await fetch(serverAddress);

    // Assert
    expect(response.status).toBe(StatusCodes.ok);
    const responseJson = await response.json();

    for (const header of [controllerHeader, actionHeader1, actionHeader2]) {
      expect(response.headers.get(header.key)).toEqual(header.value);
      expect(responseJson[header.key]).toEqual(header.value);
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
