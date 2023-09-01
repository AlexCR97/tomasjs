import "reflect-metadata";
import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import axios from "axios";
import { Server } from "http";
import { ExpressAppBuilder } from "./ExpressAppBuilder";
import { statusCodes } from "@/core";
import { TestContext } from "@/tests";
import { Logger } from "@tomasjs/core";

const testSuiteName = "builder/ExpressAppBuilder";

describe(testSuiteName, () => {
  let context: TestContext;
  let port: number;
  let address: string;
  let logger: Logger;

  beforeEach(() => {
    context = new TestContext(testSuiteName);
    port = context.port;
    address = context.address;
    logger = context.logger;
  });

  afterEach(async () => {
    await context.dispose();
  });

  it(`Can create a server using the ${ExpressAppBuilder.name}`, async () => {
    context.server = await new ExpressAppBuilder({ port, logger }).buildAsync();
    expect(context.server).toBeInstanceOf(Server);
  });

  it("Can reach the server via http", async () => {
    context.server = await new ExpressAppBuilder({ port, logger })
      .use((app) => {
        app.get("/", (_, res) => {
          res.sendStatus(statusCodes.ok);
        });
      })
      .buildAsync();

    const response = await axios.get(address);

    expect(response.status).toBe(statusCodes.ok);
  });
});
