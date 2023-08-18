import "reflect-metadata";
import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { bootstrapLoggerFactory } from "@tomasjs/logging";
import { Server } from "http";
import fetch from "node-fetch";
import { ExpressAppBuilder } from "./ExpressAppBuilder";
import { UseJson } from "./UseJson";
import { statusCodes } from "../core";

describe("UseJson", () => {
  let server: Server | undefined;
  const port = 3001;
  const logger = bootstrapLoggerFactory("error");

  beforeEach(async () => {
    await disposeAsync();
  });

  afterEach(async () => {
    await disposeAsync();
  });

  it(`Can bootstrap ${UseJson.name}`, async () => {
    const testJson = {
      key: "it",
      value: "works!",
    };

    server = await new ExpressAppBuilder({ port, logger })
      .use(new UseJson())
      .use((app) => {
        app.post("/", (req, res) => {
          console.log("Received!");
          res.json(req.body);
        });
      })
      .buildAsync();

    const response = await fetch(`http://localhost:${port}`, {
      method: "post",
      body: JSON.stringify(testJson),
      headers: { "Content-Type": "application/json" },
    });

    expect(response.status).toBe(statusCodes.ok);
    expect(await response.json()).toEqual(testJson);
  });

  async function disposeAsync() {
    server?.close();
  }
});
