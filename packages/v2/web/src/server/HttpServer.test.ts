import { HttpClient, HttpHeaders } from "@tomasjs/core/http";
import { HttpServer } from "./HttpServer";
import { QueryParams } from "./QueryParams";
import { JsonBody } from "./RequestBody";
import { JsonContent, PlainTextContent } from "@/content";
import { RouteParams } from "./RouteParams";
import { EndpointResponse } from "./Endpoint";
import { statusCodes } from "@/statusCodes";

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
        const jsonBody = body.asJson<typeof expectedBodyContent>();
        expect(jsonBody).toBeInstanceOf(JsonBody);

        const jsonBodyContent = jsonBody.readContent();
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

    const server = await new HttpServer({ port, middlewares: true })
      .use(async (req, res, next) => {
        console.log("1. before");
        await next();
        console.log("1. after");
      })
      .use(async (req, res, next) => {
        console.log("2. before");
        await next();
        console.log("2. after");
      })
      .use(async (req, res, next) => {
        console.log("3. before");
        await next();
        console.log("3. after");
      })
      .start();

    await client.get(`http://localhost:${port}`);

    await server.stop();
  });

  it("should fallback to a terminal middleware", async () => {
    const port = 8086;

    const server = await new HttpServer({ port, middlewares: true }).start();

    await client.get(`http://localhost:${port}`);

    await server.stop();
  });
});
