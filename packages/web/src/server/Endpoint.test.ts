import { HTTP_STATUS_CODES, HttpClient, JsonContent } from "@tomasjs/core/http";
import { HttpResponse, IHttpServer } from "@/server";
import { testHttpServer } from "@/test";
import { Endpoint } from "./Endpoint";
import { MiddlewareFunction } from "./Middleware";
import { InterceptorFunction } from "./Interceptor";
import { GuardFunction } from "./Guard";

describe("Endpoint", () => {
  const client = new HttpClient();

  let server: IHttpServer;

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

    const first: MiddlewareFunction = ({ next }) => {
      aggregation.push(1);
      return next();
    };

    const second: InterceptorFunction = (req) => {
      aggregation.push(2);
    };

    const third: GuardFunction = (req) => {
      aggregation.push(3);
      return true;
    };

    await server
      .useEndpoint(
        Endpoint.get("/", () => {
          return new HttpResponse({
            status: HTTP_STATUS_CODES.ok,
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

    expect(response.isSuccess).toBe(true);

    const responseJson = response.body.readData();

    expect(responseJson).toMatchObject({
      aggregation: [1, 2, 3],
    });
  });
});
