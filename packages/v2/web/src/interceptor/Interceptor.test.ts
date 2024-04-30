import { HttpClient } from "@tomasjs/core/http";
import { HttpServer } from "@/server";
import { HttpResponse } from "@/server";
import { statusCode } from "@/StatusCode";
import { testHttpServer } from "@/test";
import { Interceptor, interceptor } from "./Interceptor";
import { JsonContent } from "@/content";

describe("Interceptor", () => {
  const client = new HttpClient();

  const myInterceptor: Interceptor = (req) => {
    req.user.authenticate();
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

  it("should use interceptor middleware", async () => {
    await server
      .use(interceptor(myInterceptor))
      .useEndpoint("get", "/", (req) => {
        const response = { authenticated: req.user.authenticated } as const;
        return new HttpResponse({
          status: statusCode.ok,
          content: JsonContent.from(response),
        });
      })
      .start();

    const response = await client.get(`http://localhost:${server.port}`);

    expect(response.ok).toBe(true);

    const responseJson = await response.json();

    expect(responseJson).toMatchObject({ authenticated: true });
  });

  it("should use interceptor middleware shorthand", async () => {
    await server
      .useInterceptor(myInterceptor)
      .useEndpoint("get", "/", (req) => {
        const response = { authenticated: req.user.authenticated } as const;
        return new HttpResponse({
          status: statusCode.ok,
          content: JsonContent.from(response),
        });
      })
      .start();

    const response = await client.get(`http://localhost:${server.port}`);

    expect(response.ok).toBe(true);

    const responseJson = await response.json();

    expect(responseJson).toMatchObject({ authenticated: true });
  });
});
