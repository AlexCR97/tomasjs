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

describe("Server", () => {
  const client = new HttpClient();

  it("should accept connections", async () => {
    const port = 8080;

    const server = await new HttpServer({ port })
      .map("get", "/", () => new EndpointResponse({ status: statusCodes.ok }))
      .start();

    const response = await client.get(`http://localhost:${port}`);

    expect(response.ok).toBe(true);

    await server.stop();
  });

  it("should route requests", async () => {
    const port = 8081;

    const server = await new HttpServer({ port })
      .map("get", "/path/to/resource", () => {
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
      .map("get", "/", ({ query }) => {
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
      .map("post", "/", ({ body }) => {
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
      .map("get", "/path/to/:resource", ({ params }) => {
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

    const server = await new HttpServer({ port, middlewares: true })
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

    const server = await new HttpServer({ port, middlewares: true }).start();

    await client.get(`http://localhost:${port}`);

    await server.stop();
  });

  it("should provide RequestContext in the middleware", async () => {
    const port = 8087;

    const server = await new HttpServer({ port, middlewares: true })
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

    const server = await new HttpServer({ port, middlewares: true })
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

    const server = await new HttpServer({ port, middlewares: true })
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
});
