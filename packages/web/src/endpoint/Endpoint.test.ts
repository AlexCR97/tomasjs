import { HttpClient } from "@tomasjs/core/http";
import { HttpResponse, HttpServer } from "@/server";
import { statusCode } from "@/StatusCode";
import { testHttpServer } from "@/test";
import { Middleware } from "@/middleware";
import { Interceptor } from "@/interceptor";
import { Guard } from "@/guard";
import { JsonContent } from "@/content";
import { Endpoint } from "./Endpoint";

describe("Endpoint", () => {
  const client = new HttpClient();

  let server: HttpServer;

  beforeEach(async () => {
    server = await testHttpServer();
  });

  afterEach(async () => {
    await server.stop();
  });

  it("should use an endpoint", async () => {
    await server
      .useEndpoint(
        Endpoint.get("/", () => {
          return new HttpResponse();
        })
      )
      .start();
  });

  it("should apply middleware at the endpoint level", async () => {
    let aggregation: number[] = [];

    const first: Middleware = (req, res, next) => {
      aggregation.push(1);
      return next();
    };

    const second: Interceptor = (req) => {
      aggregation.push(2);
    };

    const third: Guard = (req) => {
      aggregation.push(3);
      return true;
    };

    await server
      .useEndpoint(
        Endpoint.get("/", () => {
          return new HttpResponse({
            status: statusCode.ok,
            content: JsonContent.from({
              aggregation,
            }),
          });
        })
          .use(first)
          .useInterceptor(second)
          .useGuard(third)
      )
      .start();

    const response = await client.get(`http://localhost:${server.port}`);

    expect(response.ok).toBe(true);

    const responseJson = await response.json();

    expect(responseJson).toMatchObject({
      aggregation: [1, 2, 3],
    });
  });
});
