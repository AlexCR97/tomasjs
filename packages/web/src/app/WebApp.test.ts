import "reflect-metadata";
import { HttpResponse, IHttpServer } from "@/server";
import { WebApp, WebAppBuilder } from "./WebApp";
import { statusCode } from "@/StatusCode";
import { HttpClient, IHttpClient } from "@tomasjs/core/http";
import { testHttpServer } from "@/test";

describe("WebApp", () => {
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

  it("should build a web app", async () => {
    app = await new WebAppBuilder({ server })
      .setupHttpPipeline((pipeline) => {
        pipeline.useEndpoint("GET", "/", () => {
          return new HttpResponse({
            status: statusCode.ok,
          });
        });
      })
      .build();

    await app.start();

    const response = await client.get("/");

    expect(response.isSuccess).toBe(true);
  });
});
