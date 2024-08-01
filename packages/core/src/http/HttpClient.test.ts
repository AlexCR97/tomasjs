import { LoggerBuilder } from "@/logging";
import { HttpClient } from "./HttpClient";
import { createServer } from "http";
import { HtmlContent, IHttpContent, JsonContent, PlainTextContent } from "./HttpContent";
import { HTTP_STATUS_CODES } from "./HttpStatus";
import { readToBuffer } from "@/system/streams";

describe("HttpClient", () => {
  const logger = LoggerBuilder.default().withLevel("info").build();
  const client = new HttpClient({ logger });

  const port = 3000;
  const baseUrl = `http://localhost:${port}`;
  const testServer = createServer(async (req, res) => {
    if (req.url === "/ping" || req.url === "/ping/") {
      return respond(200);
    }

    if (req.url === "/plain-text") {
      return respond(200, { content: PlainTextContent.from("Hello World!") });
    }

    if (req.url === "/html") {
      return respond(200, { content: HtmlContent.from(/*html*/ `<p>Hello World!</p>`) });
    }

    if (req.url === "/json") {
      return respond(200, { content: JsonContent.from({ foo: "bar" }) });
    }

    if (req.url === "/post/json") {
      const requestBody = await readToBuffer(req);
      return respond(201, { content: new JsonContent(requestBody) });
    }

    if (req.url === "/headers/default") {
      const secret = req.headers["x-api-key"];

      const status =
        secret === "yeah buddy!" ? HTTP_STATUS_CODES.ok : HTTP_STATUS_CODES.unauthorized;

      return respond(status);
    }

    if (req.url === "/headers/request") {
      const secret = req.headers["x-api-key"];

      const status =
        secret === "lightweight!" ? HTTP_STATUS_CODES.ok : HTTP_STATUS_CODES.unauthorized;

      return respond(status);
    }

    if (req.url === "/headers/mixed") {
      const secret1 = req.headers["x-api-key-1"];
      const secret2 = req.headers["x-api-key-2"];
      const status =
        secret1 === "Tom" && secret2 === "Pim"
          ? HTTP_STATUS_CODES.ok
          : HTTP_STATUS_CODES.unauthorized;

      return respond(status);
    }

    return respond(404);

    function respond(status: number, options?: { content?: IHttpContent<unknown> }) {
      res.statusCode = status;

      if (options?.content) {
        withContent(options.content);
      }

      return res.end();

      function withContent(content: IHttpContent<unknown>) {
        res.setHeader("content-type", content.type);
        res.write(content.data);
      }
    }
  });

  beforeAll(async () => {
    await new Promise<void>((resolve) => {
      testServer.on("listening", () => resolve(this));
      testServer.listen(port);
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      testServer.closeAllConnections();
      testServer.close((err) => (err === undefined ? resolve() : reject(err)));
    });
  });

  it("can ping test server", async () => {
    const response = await client.get(`${baseUrl}/ping`);
    expect(response.status).toBe(HTTP_STATUS_CODES.ok);
  });

  it("can get plain text", async () => {
    const response = await client.get(`${baseUrl}/plain-text`);
    expect(response.status).toBe(HTTP_STATUS_CODES.ok);

    const responseBodyContent = response.body.readData();
    expect(responseBodyContent).toMatch("Hello World!");
  });

  it("can get html", async () => {
    const response = await client.get(`${baseUrl}/html`);
    expect(response.status).toBe(HTTP_STATUS_CODES.ok);

    const responseBodyContent = response.body.readData();
    expect(responseBodyContent).toMatch(/*html*/ `<p>Hello World!</p>`);
  });

  it("can get json", async () => {
    const response = await client.get(`${baseUrl}/json`);
    expect(response.status).toBe(HTTP_STATUS_CODES.ok);

    const responseBodyContent = response.body.readData();
    expect(responseBodyContent).toMatchObject({ foo: "bar" });
  });

  it("can get external web resources", async () => {
    const response = await client.get("https://jsonplaceholder.typicode.com/todos/1");
    expect(response.status).toBe(HTTP_STATUS_CODES.ok);
  });

  it("can get json using shorthand", async () => {
    type Todo = {
      userId: number;
      id: number;
      title: string;
      completed: boolean;
    };

    const response = await client.getJson<Todo>("https://jsonplaceholder.typicode.com/todos/1");

    expect(response.userId).toBeTruthy();
    expect(response.id).toBeTruthy();
    expect(response.title).toBeTruthy();
    expect(response.completed).not.toBeUndefined();
    expect(response.completed).not.toBeNull();
  });

  it("can post json", async () => {
    const response = await client.post(`${baseUrl}/post/json`, JsonContent.from({ bar: "foo" }));

    expect(response.status).toBe(HTTP_STATUS_CODES.created);

    const responseBody = response.body.readData();
    expect(responseBody).toMatchObject({ bar: "foo" });
  });

  it("can send default headers", async () => {
    const client = new HttpClient({ headers: { "x-api-key": "yeah buddy!" }, logger });
    const response = await client.get(`${baseUrl}/headers/default`);
    expect(response.status).toBe(HTTP_STATUS_CODES.ok);
  });

  it("can send request headers", async () => {
    const unauthorizedResponse = await client.get(`${baseUrl}/headers/request`);
    expect(unauthorizedResponse.status).toBe(HTTP_STATUS_CODES.unauthorized);

    const authorizedResponse = await client.get(`${baseUrl}/headers/request`, {
      headers: { "x-api-key": "lightweight!" },
    });
    expect(authorizedResponse.status).toBe(HTTP_STATUS_CODES.ok);
  });

  it("can send default headers and request headers", async () => {
    const client = new HttpClient({ headers: { "x-api-key-1": "Tom" }, logger });

    const response = await client.get(`${baseUrl}/headers/mixed`, {
      headers: { "x-api-key-2": "Pim" },
    });

    expect(response.status).toBe(HTTP_STATUS_CODES.ok);
  });

  it("can use base url", async () => {
    type UrlPermutation = { baseUrl: string; resourceUrl: string; enabled?: boolean };

    const urlPermutations: UrlPermutation[] = [
      {
        baseUrl: "",
        resourceUrl: `http://localhost:${port}/ping`,
        enabled: true,
      },
      {
        baseUrl: "/",
        resourceUrl: `http://localhost:${port}/ping`,
        enabled: true,
      },
      {
        baseUrl: "/",
        resourceUrl: `http://localhost:${port}/ping/`,
        enabled: true,
      },
      {
        baseUrl: "",
        resourceUrl: `http://localhost:${port}/ping/`,
        enabled: true,
      },
      {
        baseUrl: `http://localhost:${port}`,
        resourceUrl: "ping",
        enabled: true,
      },
      {
        baseUrl: `http://localhost:${port}/`,
        resourceUrl: "ping",
        enabled: true,
      },
      {
        baseUrl: `http://localhost:${port}/`,
        resourceUrl: "/ping",
        enabled: true,
      },
      {
        baseUrl: `http://localhost:${port}`,
        resourceUrl: "/ping",
        enabled: true,
      },
      {
        baseUrl: `http://localhost:${port}/ping`,
        resourceUrl: "",
        enabled: true,
      },
      {
        baseUrl: `http://localhost:${port}/ping/`,
        resourceUrl: "",
        enabled: true,
      },
      {
        baseUrl: `http://localhost:${port}/ping/`,
        resourceUrl: "/",
        enabled: true,
      },
      {
        baseUrl: `http://localhost:${port}/ping`,
        resourceUrl: "/",
        enabled: true,
      },
    ];

    for (const { baseUrl, resourceUrl, enabled } of urlPermutations) {
      if (enabled) {
        const client = new HttpClient({ baseUrl, logger });
        const response = await client.get(resourceUrl);
        expect(response.status).toBe(HTTP_STATUS_CODES.ok);
      }
    }
  });
});
