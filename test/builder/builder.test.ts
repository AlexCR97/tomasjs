import "reflect-metadata";
import fetch from "node-fetch";
import { afterEach, describe, expect, it } from "@jest/globals";
import { TomasAppBuilder } from "../../src/builder";
import { environment } from "../environment";
import { tryCloseServerAsync } from "../utils/server";

describe("builder", () => {
  let server: any; // TODO Set http.Server type

  beforeEach(async () => {
    await tryCloseServerAsync(server);
  });

  afterEach(async () => {
    await tryCloseServerAsync(server);
  });

  it("AppBuilder works", () => {
    const app = new TomasAppBuilder();
    expect(app).toBeTruthy();
  });

  it("App can be built asynchronously", async () => {
    server = await new TomasAppBuilder().buildAsync(environment.api.port);
    expect(server).toBeTruthy();
  });

  it("App can be reached", async () => {
    const expectedResponse = "Api reached!";

    server = await new TomasAppBuilder()
      .use((app) =>
        app.get("/", (req, res) => {
          res.send(expectedResponse);
        })
      )
      .buildAsync(environment.api.port);

    const response = await fetch(`http://localhost:${environment.api.port}`);
    const responseText = await response.text();
    expect(responseText).toBe(expectedResponse);
  });
});
