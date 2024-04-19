import { HttpClient, HttpHeaders } from "@tomasjs/core/http";
import { HttpServer } from "./HttpServer";
import { EndpointResponse } from "./Endpoint";
import { statusCodes } from "@/statusCodes";
import { Guard, guard } from "./Guard";

describe("Guard", () => {
  const client = new HttpClient();
  const apiKeyHeader = "x-api-key";
  const apiKeyValue = "foo bar fizz buzz";

  const myGuardFunction: Guard = (req) => {
    const apiKey = req.headers[apiKeyHeader];
    return apiKey === apiKeyValue;
  };

  it("should use guard middleware", async () => {
    const port = 7070;

    const server = await new HttpServer({ port })
      .use(guard(myGuardFunction))
      .useEndpoint("get", "/", () => new EndpointResponse({ status: statusCodes.ok }))
      .start();

    const response = await client.get(`http://localhost:${port}`, {
      headers: new HttpHeaders().add(apiKeyHeader, apiKeyValue),
    });

    expect(response.ok).toBe(true);

    await server.stop();
  });

  it("should use guard middleware shorthand", async () => {
    const port = 7071;

    const server = await new HttpServer({ port })
      .useGuard(myGuardFunction)
      .useEndpoint("get", "/", () => new EndpointResponse({ status: statusCodes.ok }))
      .start();

    const response = await client.get(`http://localhost:${port}`, {
      headers: new HttpHeaders().add(apiKeyHeader, apiKeyValue),
    });

    expect(response.ok).toBe(true);

    await server.stop();
  });

  it("should deny unauthorized requests", async () => {
    const port = 7072;

    const server = await new HttpServer({ port })
      .useGuard(myGuardFunction)
      .useEndpoint("get", "/", () => new EndpointResponse({ status: statusCodes.ok }))
      .start();

    const response = await client.get(`http://localhost:${port}`);

    expect(response.status).toBe(statusCodes.unauthorized);

    await server.stop();

    const responseJson = await response.json();
  });

  it("should apply multiple guards", async () => {
    const port = 7073;

    const server = await new HttpServer({ port })
      .useGuard(() => {
        return true;
      })
      .useGuard(() => {
        return true;
      })
      .useGuard(() => {
        return true;
      })
      .useEndpoint("get", "/", () => new EndpointResponse({ status: statusCodes.ok }))
      .start();

    const response = await client.get(`http://localhost:${port}`);

    expect(response.status).toBe(statusCodes.ok);

    await server.stop();
  });
});
