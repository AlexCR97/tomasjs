import "reflect-metadata";
import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { AppBuilder } from "./AppBuilder";
import { UseJson } from "./UseJson";
import { Logger } from "@tomasjs/core";
import { TestContext } from "@/tests";
import { statusCodes } from "@/core";
import axios from "axios";

const testSuiteName = "builder/UseJson";

describe(testSuiteName, () => {
  let context: TestContext;
  let port: number;
  let address: string;
  let logger: Logger;

  beforeEach(async () => {
    context = await TestContext.new(testSuiteName);
    port = context.port;
    address = context.address;
    logger = context.logger;
  });

  afterEach(async () => {
    await context.dispose();
  });

  it(`Can bootstrap ${UseJson.name}`, async () => {
    const testJson = {
      key: "it",
      value: "works!",
    };

    context.server = await new AppBuilder({ port, logger })
      .use(new UseJson())
      .use((app) => {
        app.post("/", (req, res) => res.json(req.body));
      })
      .buildAsync();

    const response = await axios.post(address, testJson);

    expect(response.status).toBe(statusCodes.ok);
    expect(response.data).toEqual(testJson);
  });
});
