import "reflect-metadata";
import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { controller } from "./@controller";
import { httpPost } from "./@http";
import { UseControllers } from "./UseControllers";
import { FormFile } from "./FormFile";
import axios from "axios";
import { UseFiles } from "./UseFiles";
import { files } from "./@files";
import { FormFiles } from "./FormFiles";
import { Logger } from "@tomasjs/core";
import { TestContext } from "@/tests";
import { ExpressAppBuilder } from "@/builder";

const testSuiteName = "controllers/@files";

describe("controllers-filesDecorator", () => {
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

  it("The @files decorator can inject the entire form files into the controller's method parameters", async () => {
    @controller("test")
    class TestController {
      @httpPost("files")
      find(@files() files: FormFiles) {
        logger.debug("received post");

        expect(files["file1"]).toBeTruthy();
        expect(files["file1"]).toBeInstanceOf(FormFile);

        expect(files["file2"]).toBeTruthy();
        expect(files["file2"]).toBeInstanceOf(FormFile);

        expect(Array.isArray(files["file3&4"])).toBeTruthy();
        expect((files["file3&4"] as FormFile[])[0]).toBeInstanceOf(FormFile);
        expect((files["file3&4"] as FormFile[])[1]).toBeInstanceOf(FormFile);
      }
    }

    context.server = await new ExpressAppBuilder({ port, logger })
      // Order matters! UseFiles must go before UseControllers
      .use(
        new UseFiles({
          options: {},
          logger,
        })
      )
      .use(new UseControllers({ controllers: [TestController] }))
      .buildAsync();

    const formData = new FormData();
    formData.append("file1", new Blob(["File 1"]));
    formData.append("file2", new Blob(["File 2"]));
    formData.append("file3&4", new Blob(["File 3"]));
    formData.append("file3&4", new Blob(["File 4"]));

    logger.debug("posting...");

    await axios.post(`${address}/test/files`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    logger.debug("posted!");
  });
});
