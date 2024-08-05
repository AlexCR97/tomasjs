import { HttpClient, HttpHeaders } from "@tomasjs/core/http";
import { IHttpServer } from "@/server";
import { HttpResponse } from "@/server";
import { statusCode } from "@/StatusCode";
import { GuardFunction, guard } from "./Guard";
import { testHttpServer } from "@/test";

describe("Guard", () => {
  const client = new HttpClient();
  const apiKeyHeader = "x-api-key";
  const apiKeyValue = "foo bar fizz buzz";

  const myGuardFunction: GuardFunction = (req) => {
    const apiKey = req.headers[apiKeyHeader];
    return apiKey === apiKeyValue;
  };

  let server: IHttpServer;

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
      .useEndpoint("GET", "/", () => new HttpResponse({ status: statusCode.ok }))
      .start();

    const response = await client.get(`http://localhost:${server.port}`, {
      headers: new HttpHeaders().add(apiKeyHeader, apiKeyValue),
    });

    expect(response.isSuccess).toBe(true);
  });

  it("should use guard middleware shorthand", async () => {
    await server
      .useGuard(myGuardFunction)
      .useEndpoint("GET", "/", () => new HttpResponse({ status: statusCode.ok }))
      .start();

    const response = await client.get(`http://localhost:${server.port}`, {
      headers: new HttpHeaders().add(apiKeyHeader, apiKeyValue),
    });

    expect(response.isSuccess).toBe(true);
  });

  it("should deny unauthorized requests", async () => {
    await server
      .useGuard(myGuardFunction)
      .useEndpoint("GET", "/", () => new HttpResponse({ status: statusCode.ok }))
      .start();

    const response = await client.get(`http://localhost:${server.port}`);

    expect(response.status).toBe(statusCode.unauthorized);

    const responseJson = response.body.readData();
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
      .useEndpoint("GET", "/", () => new HttpResponse({ status: statusCode.ok }))
      .start();

    const response = await client.get(`http://localhost:${server.port}`);

    expect(response.status).toBe(statusCode.ok);
  });
});
