import { HttpClient, HttpHeaders } from "@tomasjs/core/http";
import { HttpServer } from "./HttpServer";
import { QueryParams } from "./QueryParams";
import { JsonContent, PlainTextContent } from "@/content";
import { RouteParams } from "./RouteParams";
import { EndpointResponse, endpoints } from "@/endpoint";
import { statusCodes } from "@/statusCodes";
import { RequestContext } from "./RequestContext";
import { ResponseWriter } from "./ResponseWriter";
import { problemDetailsErrorHandler } from "@/error-handler";
import { TomasError } from "@tomasjs/core/errors";
import { testHttpServer } from "@/test";

describe("Server", () => {
  const client = new HttpClient();

  let server: HttpServer;

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
      .useEndpoint("get", "/", () => new EndpointResponse({ status: statusCodes.ok }))
      .start();

    const response = await client.get(`http://localhost:${server.port}`);

    expect(response.ok).toBe(true);
  });

  it("should route requests", async () => {
    await server
      .useEndpoint("get", "/path/to/resource", () => {
        return new EndpointResponse({
          status: statusCodes.ok,
          content: PlainTextContent.from("Hooray!"),
        });
      })
      .start();

    const response = await client.get(`http://localhost:${server.port}/path/to/resource`);

    expect(response.ok).toBe(true);

    const responseText = await response.text();

    expect(responseText).toMatch("Hooray!");
  });

  it("should provide query params", async () => {
    const queryParams = new QueryParams({
      offset: "10",
      limit: "25",
    });

    await server
      .useEndpoint("get", "/", ({ query }) => {
        return new EndpointResponse({
          status: statusCodes.ok,
          content: JsonContent.from(query.toPlain()),
        });
      })
      .start();

    const response = await client.get(`http://localhost:${server.port}?${queryParams.toString()}`);

    expect(response.ok).toBe(true);

    const responseJson = await response.json();

    expect(responseJson).toMatchObject(queryParams.toPlain());
  });

  it("should provide a json request body", async () => {
    const expectedBodyContent = {
      foo: "bar",
      fizz: "buzz",
    } as const;

    await server
      .useEndpoint("post", "/", ({ body }) => {
        expect(body).toBeInstanceOf(JsonContent);

        const jsonBody = body as JsonContent<typeof expectedBodyContent>;
        const jsonBodyContent = jsonBody.readData();
        expect(jsonBodyContent).toMatchObject(expectedBodyContent);

        return new EndpointResponse({
          status: statusCodes.ok,
          content: JsonContent.from(jsonBodyContent),
        });
      })
      .start();

    const response = await client.post(
      `http://localhost:${server.port}`,
      JSON.stringify(expectedBodyContent),
      {
        headers: new HttpHeaders().add("content-type", "application/json"),
      }
    );

    expect(response.ok).toBe(true);

    const responseJson = await response.json();

    expect(responseJson).toMatchObject(expectedBodyContent);
  });

  it("should provide route params", async () => {
    await server
      .useEndpoint("get", "/path/to/:resource", ({ params }) => {
        expect(params).toBeInstanceOf(RouteParams);

        return new EndpointResponse({
          status: statusCodes.ok,
          content: JsonContent.from(params.toPlain()),
        });
      })
      .start();

    const response = await client.get(`http://localhost:${server.port}/path/to/1`);

    expect(response.ok).toBe(true);

    const responseJson = await response.json();

    expect(responseJson).toMatchObject({
      resource: "1",
    });
  });

  it("should use middlewares", async () => {
    let counterForBefore = 0;
    let counterForAfter = 0;

    await server
      .use(async (req, res, next) => {
        counterForBefore++;
        await next();
        counterForAfter++;
      })
      .use(async (req, res, next) => {
        counterForBefore++;
        await next();
        counterForAfter++;
      })
      .use(async (req, res, next) => {
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
      .use((req, _, next) => {
        expect(req).toBeInstanceOf(RequestContext);
        return next();
      })
      .start();

    await client.get(`http://localhost:${server.port}`);
  });

  it("should provide ResponseWriter in the middleware", async () => {
    await server
      .use((_, res, next) => {
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
            method: "get",
            path: "/",
            handler: () => {
              return new EndpointResponse({
                status: statusCodes.ok,
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
      .useEndpoint("get", "/", () => {
        throw new Error("This is a custom error!");
      })
      .start();

    const response = await client.get(`http://localhost:${server.port}`);

    expect(response.status).toBe(statusCodes.internalServerError);
  });

  it("should use a custom error handler", async () => {
    type ErrorResponse = { type: string; message: string };

    await server
      .useEndpoint("get", "/", () => {
        throw new Error("This is a custom error!");
      })
      .useErrorHandler(async (req, res, err) => {
        const error = err as Error;

        const errorResponse: ErrorResponse = {
          type: error.name,
          message: error.message,
        };

        return await res
          .withStatus(statusCodes.internalServerError)
          .withContent(JsonContent.from(errorResponse))
          .send();
      })
      .start();

    const response = await client.get(`http://localhost:${server.port}`);

    expect(response.status).toBe(statusCodes.internalServerError);

    const responseJson = (await response.json()) as ErrorResponse;

    expect(responseJson.type).toMatch(Error.name);
    expect(responseJson.message).toMatch("This is a custom error!");
  });

  it("should use Problem Details error handler", async () => {
    await server
      .useEndpoint("get", "/", () => {
        throw new TomasError("custom/error", "This is a custom error!", {
          data: { foo: "bar" },
          innerError: new TomasError("custom/innerError", "This is an inner error!", {
            data: { fizz: "buzz" },
            innerError: "some random value",
          }),
        });
      })
      .useErrorHandler(problemDetailsErrorHandler({ includeError: true }))
      .start();

    const response = await client.get(`http://localhost:${server.port}`);

    expect(response.status).toBe(statusCodes.internalServerError);

    const responseJson = await response.json();

    // expect(responseJson.type).toMatch(Error.name);
    // expect(responseJson.message).toMatch("This is a custom error!");
  });
});
