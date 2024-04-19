import { HttpClient, HttpHeaders } from "@tomasjs/core/http";
import { HttpServer } from "./HttpServer";
import { QueryParams } from "./QueryParams";
import { JsonContent, PlainTextContent } from "@/content";
import { RouteParams } from "./RouteParams";
import { EndpointResponse } from "./Endpoint";
import { statusCodes } from "@/statusCodes";
import { RequestContext } from "./RequestContext";
import { ResponseWriter } from "./ResponseWriter";
import { endpointsMiddleware } from "./EndpointMiddleware";
import { problemDetailsErrorHandler } from "./ProblemDetailsErrorHandler";
import { TomasError } from "@tomasjs/core/errors";

describe("Server", () => {
  const client = new HttpClient();

  it("should accept connections", async () => {
    const port = 8080;

    const server = await new HttpServer({ port })
      .useEndpoint("get", "/", () => new EndpointResponse({ status: statusCodes.ok }))
      .start();

    const response = await client.get(`http://localhost:${port}`);

    expect(response.ok).toBe(true);

    await server.stop();
  });

  it("should route requests", async () => {
    const port = 8081;

    const server = await new HttpServer({ port })
      .useEndpoint("get", "/path/to/resource", () => {
        return new EndpointResponse({
          status: statusCodes.ok,
          content: PlainTextContent.from("Hooray!"),
        });
      })
      .start();

    const response = await client.get(`http://localhost:${port}/path/to/resource`);

    expect(response.ok).toBe(true);

    const responseText = await response.text();

    expect(responseText).toMatch("Hooray!");

    await server.stop();
  });

  it("should provide query params", async () => {
    const port = 8082;

    const queryParams = new QueryParams({
      offset: "10",
      limit: "25",
    });

    const server = await new HttpServer({ port })
      .useEndpoint("get", "/", ({ query }) => {
        return new EndpointResponse({
          status: statusCodes.ok,
          content: JsonContent.from(query.toPlain()),
        });
      })
      .start();

    const response = await client.get(`http://localhost:${port}?${queryParams.toString()}`);

    await server.stop();

    expect(response.ok).toBe(true);

    const responseJson = await response.json();

    expect(responseJson).toMatchObject(queryParams.toPlain());
  });

  it("should provide a json request body", async () => {
    const port = 8083;

    const expectedBodyContent = {
      foo: "bar",
      fizz: "buzz",
    } as const;

    const server = await new HttpServer({ port })
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
      `http://localhost:${port}`,
      JSON.stringify(expectedBodyContent),
      {
        headers: new HttpHeaders().add("content-type", "application/json"),
      }
    );

    await server.stop();

    expect(response.ok).toBe(true);

    const responseJson = await response.json();

    expect(responseJson).toMatchObject(expectedBodyContent);
  });

  it("should provide route params", async () => {
    const port = 8084;

    const server = await new HttpServer({ port })
      .useEndpoint("get", "/path/to/:resource", ({ params }) => {
        expect(params).toBeInstanceOf(RouteParams);

        return new EndpointResponse({
          status: statusCodes.ok,
          content: JsonContent.from(params.toPlain()),
        });
      })
      .start();

    const response = await client.get(`http://localhost:${port}/path/to/1`);

    await server.stop();

    expect(response.ok).toBe(true);

    const responseJson = await response.json();

    expect(responseJson).toMatchObject({
      resource: "1",
    });
  });

  it("should use middlewares", async () => {
    const port = 8085;
    let counterForBefore = 0;
    let counterForAfter = 0;

    const server = await new HttpServer({ port })
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

    await client.get(`http://localhost:${port}`);

    await server.stop();

    expect(counterForBefore).toBe(3);
    expect(counterForAfter).toBe(3);
  });

  it("should fallback to a terminal middleware", async () => {
    const port = 8086;

    const server = await new HttpServer({ port }).start();

    await client.get(`http://localhost:${port}`);

    await server.stop();
  });

  it("should provide RequestContext in the middleware", async () => {
    const port = 8087;

    const server = await new HttpServer({ port })
      .use((req, _, next) => {
        expect(req).toBeInstanceOf(RequestContext);
        return next();
      })
      .start();

    await client.get(`http://localhost:${port}`);

    await server.stop();
  });

  it("should provide ResponseWriter in the middleware", async () => {
    const port = 8088;

    const server = await new HttpServer({ port })
      .use((_, res, next) => {
        expect(res).toBeInstanceOf(ResponseWriter);
        return next();
      })
      .start();

    await client.get(`http://localhost:${port}`);

    await server.stop();
  });

  it("should use endpoints middleware", async () => {
    const port = 8089;

    const server = await new HttpServer({ port })
      .use(
        endpointsMiddleware([
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

    await client.get(`http://localhost:${port}`);

    await server.stop();
  });

  it("should use the default error handler", async () => {
    const port = 8090;

    const server = await new HttpServer({ port })
      .useEndpoint("get", "/", () => {
        throw new Error("This is a custom error!");
      })
      .start();

    const response = await client.get(`http://localhost:${port}`);

    await server.stop();

    expect(response.status).toBe(statusCodes.internalServerError);
  });

  it("should use a custom error handler", async () => {
    const port = 8090;

    type ErrorResponse = { type: string; message: string };

    const server = await new HttpServer({ port })
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

    const response = await client.get(`http://localhost:${port}`);

    await server.stop();

    expect(response.status).toBe(statusCodes.internalServerError);

    const responseJson = (await response.json()) as ErrorResponse;

    expect(responseJson.type).toMatch(Error.name);
    expect(responseJson.message).toMatch("This is a custom error!");
  });

  it("should use Problem Details error handler", async () => {
    const port = 8091;

    const server = await new HttpServer({ port })
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

    const response = await client.get(`http://localhost:${port}`);

    await server.stop();

    expect(response.status).toBe(statusCodes.internalServerError);

    const responseJson = await response.json();

    // expect(responseJson.type).toMatch(Error.name);
    // expect(responseJson.message).toMatch("This is a custom error!");
  });
});
