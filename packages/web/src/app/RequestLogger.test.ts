import "reflect-metadata";
import { HttpResponse, IHttpServer } from "@/server";
import { HTTP_STATUS_CODES, HttpClient, IHttpClient, JsonContent } from "@tomasjs/core/http";
import { WebApp, WebAppBuilder } from "./WebApp";
import { testHttpServer } from "@/test";
import { RequestProfiler, requestProfilerOptions } from "./RequestProfiler";
import { timeout } from "@/common";

// TODO Rename test suite
describe("xx-RequestProfiler", () => {
  let client: IHttpClient;
  let server: IHttpServer;
  let app: WebApp | undefined;

  beforeEach(async () => {
    server = await testHttpServer();
    client = new HttpClient({ baseUrl: `http://localhost:${server.port}` });
  });

  afterEach(async () => {
    if (app) {
      await app.stop();
    }
  });

  it("should profile an http request", async () => {
    app = await new WebAppBuilder({ server })
      .setupContainer((container) => {
        container.setup(
          requestProfilerOptions({
            headers: true,
            query: true,
            body: true,
          })
        );
      })
      .setupHttpPipeline((pipeline) => {
        pipeline.use(RequestProfiler);

        pipeline.get("/ok", async () => {
          await timeout(100);
          return new HttpResponse({ status: HTTP_STATUS_CODES.ok });
        });

        pipeline.post("/accepted", async () => {
          await timeout(250);
          return new HttpResponse({ status: HTTP_STATUS_CODES.accepted });
        });
      })
      .build();

    await app.start();

    const response1 = await client.get("/ok?one=1&two=2");
    expect(response1.status).toBe(HTTP_STATUS_CODES.ok);

    const response2 = await client.post(
      "/accepted",
      JsonContent.from({ foo: "bar", fizz: "buzz" })
    );
    expect(response2.status).toBe(HTTP_STATUS_CODES.accepted);
  });
});
