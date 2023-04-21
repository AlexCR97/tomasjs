import "reflect-metadata";
import fetch from "node-fetch";
import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { AppBuilder } from "./AppBuilder";
import { tryCloseServerAsync } from "../tests/utils";

describe("builder", () => {
  let server: any; // TODO Set http.Server type
  const port = 3031;

  beforeEach(async () => {
    await tryCloseServerAsync(server);
  });

  afterEach(async () => {
    await tryCloseServerAsync(server);
  });

  it("AppBuilder works", () => {
    const app = new AppBuilder();
    expect(app).toBeTruthy();
  });

  it("App can be built asynchronously", async () => {
    server = await new AppBuilder().buildAsync(port);
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
      .buildAsync(port);

    const response = await fetch(`http://localhost:${port}`);
    const responseText = await response.text();
    expect(responseText).toBe(expectedResponse);
  });
});
