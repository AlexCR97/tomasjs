import { HttpClient, HttpHeaders } from "@tomasjs/core/http";
import { HttpServer } from "@/server";
import { HttpResponse } from "@/server";
import { statusCode } from "@/StatusCode";
import { Guard, guard } from "./Guard";
import { testHttpServer } from "@/test";

describe("Guard", () => {
  const client = new HttpClient();
  const apiKeyHeader = "x-api-key";
  const apiKeyValue = "foo bar fizz buzz";

  const myGuardFunction: Guard = (req) => {
    const apiKey = req.headers[apiKeyHeader];
    return apiKey === apiKeyValue;
  };

  let server: HttpServer;

  beforeEach(async () => {
    server = await testHttpServer();
  });

  afterEach(async () => {
    if (server) {
      await server.stop();
    }
  });

  it("should use guard middleware", async () => {
    await server
      .use(guard(myGuardFunction))
      .useEndpoint("get", "/", () => new HttpResponse({ status: statusCode.ok }))
      .start();

    const response = await client.get(`http://localhost:${server.port}`, {
      headers: new HttpHeaders().add(apiKeyHeader, apiKeyValue),
    });

    expect(response.ok).toBe(true);
  });

  it("should use guard middleware shorthand", async () => {
    await server
      .useGuard(myGuardFunction)
      .useEndpoint("get", "/", () => new HttpResponse({ status: statusCode.ok }))
      .start();

    const response = await client.get(`http://localhost:${server.port}`, {
      headers: new HttpHeaders().add(apiKeyHeader, apiKeyValue),
    });

    expect(response.ok).toBe(true);
  });

  it("should deny unauthorized requests", async () => {
    await server
      .useGuard(myGuardFunction)
      .useEndpoint("get", "/", () => new HttpResponse({ status: statusCode.ok }))
      .start();

    const response = await client.get(`http://localhost:${server.port}`);

    expect(response.status).toBe(statusCode.unauthorized);

    const responseJson = await response.json();
  });

  it("should apply multiple guards", async () => {
    await server
      .useGuard(() => {
        return true;
      })
      .useGuard(() => {
        return true;
      })
      .useGuard(() => {
        return true;
      })
      .useEndpoint("get", "/", () => new HttpResponse({ status: statusCode.ok }))
      .start();

    const response = await client.get(`http://localhost:${server.port}`);

    expect(response.status).toBe(statusCode.ok);
  });
});
