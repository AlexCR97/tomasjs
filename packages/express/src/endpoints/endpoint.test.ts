import "reflect-metadata";
import { afterEach, beforeEach, describe, it } from "@jest/globals";
import { Logger } from "@tomasjs/core";
import { AppBuilder } from "@/builder";
import { TestContext } from "@/tests";
import { OkResponse } from "@/responses";
import { isHttpContext, statusCodes } from "@/core";
import { endpoint } from "./endpoint";

const testSuiteName = "endpoints/endpoint";

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

  it("Can bootstrap a GET endpoint", async () => {
    context.server = await new AppBuilder({ port, logger })
      .use(
        endpoint("get", "/", () => {
          logger.debug("get!");
          return new OkResponse();
        })
      )
      .buildAsync();

    const response = await fetch(address);

    expect(response.status).toBe(statusCodes.ok);
  });

  it("Can inject args into an endpoint", async () => {
    context.server = await new AppBuilder({ port, logger })
      .use(
        endpoint(
          "get",
          "/",
          ({ httpContext, services }) => {
            expect(httpContext).toBeTruthy();
            expect(isHttpContext(httpContext)).toBeTruthy();
            expect(services).toBeTruthy();
            return new OkResponse();
          },
          {
            middlewares: [],
            interceptors: [],
            guards: [],
          }
        )
      )
      .buildAsync();

    const response = await fetch(address);

    expect(response.status).toBe(statusCodes.ok);
  });
});
