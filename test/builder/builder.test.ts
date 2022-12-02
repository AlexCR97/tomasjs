import "reflect-metadata";
import fetch from "node-fetch";
import { afterEach, describe, expect, it } from "@jest/globals";
import { AppBuilder } from "../../src/builder";
import { environment } from "../../src/environment";

describe("AppBuilder", () => {
  let server: any; // TODO Set http.Server type

  afterEach(async () => {
    if (server) {
      await new Promise<void>((resolve) => {
        server.close(() => {
          server = undefined;
          resolve();
        });
      });
    }
  });

  it("AppBuilder works", () => {
    const app = new AppBuilder();
    expect(app).toBeTruthy();
  });

  it("App can be built asynchronously", async () => {
    server = await new AppBuilder().buildAsync();
    expect(server).toBeTruthy();
  });

  it("App can be reached", async () => {
    const expectedResponse = "Api reached!";

    server = await new AppBuilder()
      .use((app) =>
        app.get("/", (req, res) => {
          res.send(expectedResponse);
        })
      )
      .buildAsync();

    const response = await fetch(`http://localhost:${environment.api.port}`);
    const responseText = await response.text();
    expect(responseText).toBe(expectedResponse);
  });
});
