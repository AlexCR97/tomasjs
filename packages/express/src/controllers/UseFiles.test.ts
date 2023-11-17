import "reflect-metadata";
import { afterEach, beforeEach, describe, it } from "@jest/globals";
import { controller } from "./@controller";
import { httpGet } from "./@http";
import axios from "axios";
import { Logger } from "@tomasjs/core";
import { TestContext } from "@/tests";
import { AppBuilder } from "@/builder";
import { FileResponse } from "@/responses";
import { statusCodes } from "@/core";
import path from "path";

const testSuiteName = "controllers/UseFiles";

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

  it("Can respond with a file", async () => {
    @controller("test")
    class TestController {
      @httpGet()
      serveFile() {
        const filePath = path.join(path.resolve(), "package.json");
        return new FileResponse(filePath);
      }
    }

    context.server = await new AppBuilder({ port, logger })
      // Order matters! useFiles must go before useControllers
      .useFiles()
      .useControllers(TestController)
      .buildAsync();

    const response = await axios.get(`${address}/test`);

    expect(response.status).toBe(statusCodes.ok);
  });
});
