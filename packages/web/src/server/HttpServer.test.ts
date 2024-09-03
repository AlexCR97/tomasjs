import { HTTP_STATUS_CODES, HttpClient, JsonContent, PlainTextContent } from "@tomasjs/core/http";
import { IHttpServer } from "./HttpServer";
import { QueryParams } from "./QueryParams";
import { RouteParams } from "./RouteParams";
import { RequestContext } from "./RequestContext";
import { ResponseWriter } from "./ResponseWriter";
import { testHttpServer } from "@/test";
import { HttpResponse } from "./HttpResponse";
import { endpoints } from "./Endpoint";

describe("server/HttpServer", () => {
  const client = new HttpClient();

  let server: IHttpServer;

  beforeEach(async () => {
    server = await testHttpServer();
  });

  afterEach(async () => {
    if (server) {
      await server.stop();
    }
  });

  it("should accept connections", async () => {
    await server
      .useEndpoint("GET", "/", () => new HttpResponse({ status: HTTP_STATUS_CODES.ok }))
      .start();

    const response = await client.get(`http://localhost:${server.port}`);

    expect(response.isSuccess).toBe(true);
  });

  it("should route requests", async () => {
    await server
      .useEndpoint("GET", "/path/to/resource", () => {
        return new HttpResponse({
          status: HTTP_STATUS_CODES.ok,
          content: PlainTextContent.from("Hooray!"),
        });
      })
      .start();

    const response = await client.get(`http://localhost:${server.port}/path/to/resource`);

    expect(response.isSuccess).toBe(true);

    const responseText = response.body.readData();

    expect(responseText).toMatch("Hooray!");
  });

  it("should provide query params", async () => {
    const queryParams = new QueryParams({
      offset: "10",
      limit: "25",
    });

    await server
      .useEndpoint("GET", "/", ({ query }) => {
        return new HttpResponse({
          status: HTTP_STATUS_CODES.ok,
          content: JsonContent.from(query.toPlain()),
        });
      })
      .start();

    const response = await client.get(`http://localhost:${server.port}?${queryParams.toString()}`);

    expect(response.isSuccess).toBe(true);

    const responseJson = response.body.readData();

    expect(responseJson).toMatchObject(queryParams.toPlain());
  });

  it("should provide a json request body", async () => {
    const expectedBodyContent = {
      foo: "bar",
      fizz: "buzz",
    } as const;

    await server
      .useEndpoint("POST", "/", ({ body }) => {
        expect(body).toBeInstanceOf(JsonContent);

        const jsonBody = body as JsonContent<typeof expectedBodyContent>;
        const jsonBodyContent = jsonBody.readData();
        expect(jsonBodyContent).toMatchObject(expectedBodyContent);

        return new HttpResponse({
          status: HTTP_STATUS_CODES.ok,
          content: JsonContent.from(jsonBodyContent),
        });
      })
      .start();

    const response = await client.post(
      `http://localhost:${server.port}`,
      JsonContent.from(expectedBodyContent),
      {
        headers: {
          "content-type": "application/json",
        },
      }
    );

    expect(response.isSuccess).toBe(true);

    const responseJson = response.body.readData();

    expect(responseJson).toMatchObject(expectedBodyContent);
  });

  it("should provide route params", async () => {
    await server
      .useEndpoint("GET", "/path/to/:resource", ({ params }) => {
        expect(params).toBeInstanceOf(RouteParams);

        return new HttpResponse({
          status: HTTP_STATUS_CODES.ok,
          content: JsonContent.from(params.toPlain()),
        });
      })
      .start();

    const response = await client.get(`http://localhost:${server.port}/path/to/1`);

    expect(response.isSuccess).toBe(true);

    const responseJson = response.body.readData();

    expect(responseJson).toMatchObject({
      resource: "1",
    });
  });

  it("should use middlewares", async () => {
    let counterForBefore = 0;
    let counterForAfter = 0;

    await server
      .use(async ({ next }) => {
        counterForBefore++;
        await next();
        counterForAfter++;
      })
      .use(async ({ next }) => {
        counterForBefore++;
        await next();
        counterForAfter++;
      })
      .use(async ({ next }) => {
        counterForBefore++;
        await next();
        counterForAfter++;
      })
      .start();

    await client.get(`http://localhost:${server.port}`);

    expect(counterForBefore).toBe(3);
    expect(counterForAfter).toBe(3);
  });

  it("should fallback to a terminal middleware", async () => {
    await server.start();

    await client.get(`http://localhost:${server.port}`);
  });

  it("should provide RequestContext in the middleware", async () => {
    await server
      .use(({ req, next }) => {
        expect(req).toBeInstanceOf(RequestContext);
        return next();
      })
      .start();

    await client.get(`http://localhost:${server.port}`);
  });

  it("should provide ResponseWriter in the middleware", async () => {
    await server
      .use(({ res, next }) => {
        expect(res).toBeInstanceOf(ResponseWriter);
        return next();
      })
      .start();

    await client.get(`http://localhost:${server.port}`);
  });

  it("should use endpoints middleware", async () => {
    await server
      .use(
        endpoints([
          {
            method: "GET",
            path: "/",
            handler: () => {
              return new HttpResponse({
                status: HTTP_STATUS_CODES.ok,
              });
            },
          },
        ])
      )
      .start();

    await client.get(`http://localhost:${server.port}`);
  });

  it("should use the default error handler", async () => {
    await server
      .useEndpoint("GET", "/", () => {
        throw new Error("This is a custom error!");
      })
      .start();

    const response = await client.get(`http://localhost:${server.port}`);

    expect(response.status).toBe(HTTP_STATUS_CODES.internalServerError);
  });

  it("should use a custom error handler", async () => {
    type ErrorResponse = { type: string; message: string };

    await server
      .useEndpoint("GET", "/", () => {
        throw new Error("This is a custom error!");
      })
      .useErrorHandler(async ({ res, err }) => {
        const error = err as Error;

        const errorResponse: ErrorResponse = {
          type: error.name,
          message: error.message,
        };

        return await res
          .withStatus(HTTP_STATUS_CODES.internalServerError)
          .withContent(JsonContent.from(errorResponse))
          .send();
      })
      .start();

    const response = await client.get(`http://localhost:${server.port}`);

    expect(response.status).toBe(HTTP_STATUS_CODES.internalServerError);

    const responseJson = response.body.readData() as ErrorResponse;

    expect(responseJson.type).toMatch(Error.name);
    expect(responseJson.message).toMatch("This is a custom error!");
  });
});
