import "reflect-metadata";
import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { AppBuilder } from "./AppBuilder";
import { UseJson } from "./UseJson";
import { Logger } from "@tomasjs/core";
import { TestContext } from "@/tests";
import { statusCodes } from "@/core";

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
      .useJson()
      .usePost("/", ({ httpContext }) => httpContext.request.body)
      .buildAsync();

    const response = await fetch(address, {
      method: "post",
      body: JSON.stringify(testJson),
      headers: {
        "Content-Type": "application/json",
      },
    });

    expect(response.status).toBe(statusCodes.ok);

    const responseJson = await response.json();
    expect(responseJson).toEqual(testJson);
  });
});
