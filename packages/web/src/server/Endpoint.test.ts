import {
  HtmlContent,
  HTTP_STATUS_CODES,
  HttpClient,
  HttpContentType,
  IHttpClient,
  JsonContent,
  PlainTextContent,
} from "@tomasjs/core/http";
import { ServerResponse, IHttpServer } from "@/server";
import { testHttpServer } from "@/test";
import { Endpoint } from "./Endpoint";
import { MiddlewareFunction } from "./Middleware";
import { InterceptorFunction } from "./Interceptor";
import { GuardFunction } from "./Guard";
import { ProblemDetailsBuilder, ProblemDetailsContent } from "@/problems";

describe("server/Endpoint", () => {
  let server: IHttpServer;
  let client: IHttpClient;

  beforeEach(async () => {
    server = await testHttpServer();
    client = new HttpClient({ baseUrl: `http://localhost:${server.port}` });
  });

  afterEach(async () => {
    await server.stop();
  });

  it("should respond with a ServerResponse", async () => {
    const expectedStatus = HTTP_STATUS_CODES.accepted;
    const expectedContent = "ServerResponse works!";

    await server
      .useEndpoint("GET", "/", () => {
        return new ServerResponse({
          status: expectedStatus,
          content: PlainTextContent.from(expectedContent),
        });
      })
      .start();

    const response = await client.get("/");
    expect(response.status).toBe(expectedStatus);
    expect(response.body.toString()).toMatch(expectedContent);
  });

  it("should respond with HttpContent", async () => {
    const expectedStatus = HTTP_STATUS_CODES.ok;
    const expectedContent = HtmlContent.from(/*html*/ `<h1>Home</h1>`);

    await server
      .useEndpoint("GET", "/", () => {
        return expectedContent;
      })

      .start();

    const response = await client.get("/");
    expect(response.status).toBe(expectedStatus);
    expect(response.headers["content-type"]).toMatch(expectedContent.type);
    expect(response.body.toString()).toMatch(expectedContent.toString());
  });

  it("should respond with ProblemDetails", async () => {
    const problems = new ProblemDetailsBuilder()
      .withStatus(HTTP_STATUS_CODES.conflict)
      .withTitle("A conflict ocurred")
      .build();

    await server
      .useEndpoint("GET", "/", () => {
        return problems;
      })
      .start();

    const response = await client.get("/");
    expect(response.status).toBe(problems.status);
    expect(response.headers["content-type"]).toMatch(<HttpContentType>"application/problem+json");

    const responseJson = response.body.toString();
    const responseProblems = JSON.parse(responseJson);
    expect(responseProblems.status).toBe(problems.status);
    expect(responseProblems.title).toMatch(problems.title);
  });

  it("should respond with ProblemDetailsContent", async () => {
    const problems = new ProblemDetailsBuilder()
      .withStatus(HTTP_STATUS_CODES.forbidden)
      .withTitle("Permission denied")
      .build();

    const problemsContent = ProblemDetailsContent.from(problems);

    await server
      .useEndpoint("GET", "/", () => {
        return problemsContent;
      })
      .start();

    const response = await client.get("/");
    expect(response.status).toBe(problems.status);
    expect(response.headers["content-type"]).toMatch(<HttpContentType>"application/problem+json");

    const responseJson = response.body.toString();
    const responseProblems = JSON.parse(responseJson);
    expect(responseProblems.status).toBe(problems.status);
    expect(responseProblems.title).toMatch(problems.title);
  });

  it("should respond with a status", async () => {
    const expectedStatus = HTTP_STATUS_CODES.noContent;

    await server
      .useEndpoint("GET", "/", () => {
        return expectedStatus;
      })
      .start();

    const response = await client.get("/");
    expect(response.status).toBe(expectedStatus);
  });

  it("should respond with plain text", async () => {
    const expectedStatus = HTTP_STATUS_CODES.ok;
    const expectedContent = "Plain text works!";

    await server
      .useEndpoint("GET", "/", () => {
        return expectedContent;
      })
      .start();

    const response = await client.get("/");
    expect(response.status).toBe(expectedStatus);
    expect(response.headers["content-type"]).toMatch(<HttpContentType>"text/plain");
    expect(response.body.toString()).toMatch(expectedContent);
  });

  it("should respond with json", async () => {
    const expectedStatus = HTTP_STATUS_CODES.ok;
    const expectedContent = { tenantId: 1, userId: "2" };

    await server
      .useEndpoint("GET", "/", () => {
        return expectedContent;
      })
      .start();

    const response = await client.get("/");
    expect(response.status).toBe(expectedStatus);
    expect(response.headers["content-type"]).toMatch(<HttpContentType>"application/json");

    const responseJson = response.body.toString();
    const responseContent = JSON.parse(responseJson);
    expect(responseContent).toMatchObject(expectedContent);
  });

  it("should respond with json class", async () => {
    class MyResponse {
      constructor(readonly foo: string, readonly fizz: string) {}
    }

    const expectedStatus = HTTP_STATUS_CODES.ok;
    const expectedContent = new MyResponse("bar", "buzz");

    await server
      .useEndpoint("GET", "/", () => {
        return expectedContent;
      })
      .start();

    const response = await client.get("/");
    expect(response.status).toBe(expectedStatus);
    expect(response.headers["content-type"]).toMatch(<HttpContentType>"application/json");

    const responseJson = response.body.toString();
    const responseContent = JSON.parse(responseJson);
    expect(responseContent).toMatchObject(expectedContent);
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
          return new ServerResponse({
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

    const response = await client.get("/");

    expect(response.isSuccess).toBe(true);

    const responseJson = response.body.readData();

    expect(responseJson).toMatchObject({
      aggregation: [1, 2, 3],
    });
  });
});
