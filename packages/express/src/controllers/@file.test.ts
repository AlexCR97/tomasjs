import "reflect-metadata";
import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { controller } from "./@controller";
import { httpPost } from "./@http";
import { AppBuilder } from "../builder";
import { FormFile } from "./FormFile";
import axios from "axios";
import { file } from "./@file";
import { Logger } from "@tomasjs/core";
import { TestContext } from "@/tests";

const testSuiteName = "controllers/@file";

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

  it("The @file decorator can inject multiple request form files into the controller's method parameters", async () => {
    @controller("test")
    class TestController {
      @httpPost("files")
      find(@file("file1") file1: FormFile, @file("file2") file2: FormFile) {
        logger.debug("received post");
        for (const file of [file1, file2]) {
          expect(file).toBeTruthy();
          expect(file).toBeInstanceOf(FormFile);
        }
      }
    }

    context.server = await new AppBuilder({ port })
      // Order matters! UseFiles must go before UseControllers
      .useFiles({})
      .useControllers(TestController)
      .buildAsync();

    const formData = new FormData();
    formData.append("file1", new Blob(["File 1"]));
    formData.append("file2", new Blob(["File 2"]));

    logger.debug("posting...");

    await axios.post(`${address}/test/files`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    logger.debug("posted!");
  });
});
