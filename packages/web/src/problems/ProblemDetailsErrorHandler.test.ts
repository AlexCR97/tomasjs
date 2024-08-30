import { IHttpServer } from "@/server";
import { testHttpServer } from "@/test";
import { HTTP_STATUS_CODES, HttpClient, IHttpClient } from "@tomasjs/core/http";
import { problemDetails } from "./ProblemDetailsErrorHandler";
import { TomasError } from "@tomasjs/core/errors";
import { ProblemDetails } from "./ProblemDetails";
import { errorExtension } from "./ErrorExtension";
import { HTTP_STATUS } from "@/HttpStatus";

describe("problems/ProblemDetailsErrorHandler", () => {
  let server: IHttpServer;
  let client: IHttpClient = new HttpClient();

  beforeEach(async () => {
    server = await testHttpServer();
    client = new HttpClient({ baseUrl: `http://localhost:${server.port}` });
  });

  afterEach(async () => {
    if (server) {
      await server.stop();
    }
  });

  it("should return a problem details response", async () => {
    await server
      .useErrorHandler(problemDetails())
      .useEndpoint("GET", "/", () => {
        throw new Error("This is an error!");
      })
      .start();

    const response = await client.get("/");
    expect(response.status).toBe(HTTP_STATUS_CODES.internalServerError);

    const responseStr = response.body.toString();
    const responseJson = JSON.parse(responseStr);
    expect(responseJson.type).toMatch(HTTP_STATUS.internalServerError.type);
    expect(responseJson.status).toBe(HTTP_STATUS.internalServerError.code);
    expect(responseJson.title).toMatch(HTTP_STATUS.internalServerError.title);
    expect(responseJson.details).toMatch(HTTP_STATUS.internalServerError.details);
    expect(responseJson.instance).toMatch("/");
  });

  it("should configure the problem details with a new problem details", async () => {
    const expected = ProblemDetails.from({
      type: "foo",
      status: HTTP_STATUS_CODES.badRequest,
      title: "bar",
      details: "Lorem ipsum",
      instance: "/test",
      extensions: {
        fizz: "buzz",
      },
    });

    await server
      .useErrorHandler(
        problemDetails({
          configure: ({ req, err, problem }) => {
            return ProblemDetails.from(expected);
          },
        })
      )
      .useEndpoint("GET", "/", () => {
        throw new Error("This is an error!");
      })
      .start();

    const response = await client.get("/");
    const responseStr = response.body.toString();
    const responseJson = JSON.parse(responseStr);
    expect(responseJson).toMatchObject(expected.toPlain());
  });

  it("should configure the problem details using the builder", async () => {
    const expected = ProblemDetails.from({
      type: "foo",
      status: HTTP_STATUS_CODES.badRequest,
      title: "bar",
      details: "Lorem ipsum",
      instance: "/test",
      extensions: {
        fizz: "buzz",
      },
    });

    await server
      .useErrorHandler(
        problemDetails({
          configure: ({ req, err, problem }) => {
            return problem
              .withType(expected.type)
              .withStatus(expected.status)
              .withTitle(expected.title)
              .withDetails(expected.details)
              .withInstance(expected.instance)
              .withExtensions(expected.extensions);
          },
        })
      )
      .useEndpoint("GET", "/", () => {
        throw new Error("This is an error!");
      })
      .start();

    const response = await client.get("/");
    const responseStr = response.body.toString();
    const responseJson = JSON.parse(responseStr);
    expect(responseJson).toMatchObject(expected.toPlain());
  });

  it("should extend problem details with a value", async () => {
    await server
      .useErrorHandler(problemDetails({ extensions: [{ foo: "bar", fizz: "buzz" }] }))
      .useEndpoint("GET", "/", () => {
        throw new Error("This is an error!");
      })
      .start();

    const response = await client.get("/");

    expect(response.status).toBe(HTTP_STATUS_CODES.internalServerError);

    const responseStr = response.body.toString();
    const responseJson = JSON.parse(responseStr);
    expect(responseJson.foo).toMatch("bar");
    expect(responseJson.fizz).toMatch("buzz");
  });

  it("should extend problem details with a factory", async () => {
    await server
      .useErrorHandler(problemDetails({ extensions: [() => ({ timestamp: Date.now() })] }))
      .useEndpoint("GET", "/", () => {
        throw new Error("This is an error!");
      })
      .start();

    const response = await client.get("/");

    expect(response.status).toBe(HTTP_STATUS_CODES.internalServerError);

    const responseStr = response.body.toString();
    const responseJson = JSON.parse(responseStr);
    expect(responseJson.timestamp).toBeLessThanOrEqual(Date.now());
  });

  it("should extend problem details with the error", async () => {
    const theError = new TomasError("custom_error", "This is an error!", {
      data: { timestamp: Date.now() },
      innerError: new Error("This is an inner error"),
    });

    await server
      .useErrorHandler(problemDetails({ extensions: [errorExtension({ stack: true })] }))
      .useEndpoint("GET", "/", () => {
        throw theError;
      })
      .start();

    const response = await client.get("/");
    expect(response.status).toBe(HTTP_STATUS_CODES.internalServerError);

    const responseStr = response.body.toString();
    const responseJson = JSON.parse(responseStr);
    expect(responseJson.error).toMatchObject({
      name: theError.name,
      message: theError.message,
      stack: theError.stack,
      code: theError.code,
      data: theError.data,
      innerError: {
        name: theError.innerError.name,
        message: theError.innerError.message,
        stack: theError.innerError.stack,
      },
    });
  });
});
