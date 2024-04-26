import { HttpClient } from "@tomasjs/core/http";
import { HttpServer } from "./HttpServer";
import { EndpointResponse } from "./Endpoint";
import { statusCodes } from "@/statusCodes";
import { testHttpServer } from "@/test";
import { Middleware } from "./Middleware";
import { Interceptor } from "./Interceptor";
import { Guard } from "./Guard";
import { JsonContent } from "@/content";

describe("Endpoint", () => {
  const client = new HttpClient();

  let server: HttpServer;

  beforeEach(async () => {
    server = await testHttpServer();
  });

  afterEach(async () => {
    await server.stop();
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
        "get",
        "/",
        () => {
          return new EndpointResponse({
            status: statusCodes.ok,
            content: JsonContent.from({
              aggregation,
            }),
          });
        },
        { middlewares: [first], interceptors: [second], guards: [third] }
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
