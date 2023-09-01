import "reflect-metadata";
import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import axios from "axios";
import { Server } from "http";
import { ExpressAppBuilder } from "./ExpressAppBuilder";
import { statusCodes } from "../core";
import { TomasLogger } from "@tomasjs/core";

describe("ExpressAppBuilder", () => {
  let server: Server | undefined;
  const port = 3000;
  const logger = new TomasLogger("ExpressAppBuilder", "error");

  beforeEach(async () => {
    await disposeAsync();
  });

  afterEach(async () => {
    await disposeAsync();
  });

  it(`Can create a server using the ${ExpressAppBuilder.name}`, async () => {
    server = await new ExpressAppBuilder({ logger }).buildAsync();
    expect(server).toBeInstanceOf(Server);
  });

  it("Can reach the server via http", async () => {
    logger.debug("Mocking server ...");

    server = await new ExpressAppBuilder({ port, logger })
      .use((app) => {
        app.get("/", (req, res) => {
          res.sendStatus(statusCodes.ok);
        });
      })
      .buildAsync();

    logger.debug("Server mocked!");

    logger.debug("Fetching response ...");
    const response = await axios.get(`http://localhost:${port}`);
    logger.debug("Response fetched!");

    expect(response.status).toBe(statusCodes.ok);
  });

  async function disposeAsync() {
    server?.close();
  }
});
