import "reflect-metadata";
import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { Server } from "http";
import { controller } from "./@controller";
import { httpPost } from "./@http";
import { bootstrapLoggerFactory } from "@tomasjs/logging";
import { ExpressAppBuilder } from "../builder";
import { UseControllers } from "./UseControllers";
import { FormFile } from "./FormFile";
import axios from "axios";
import { UseFiles } from "./UseFiles";
import { files } from "./@files";
import { FormFiles } from "./FormFiles";

describe("controllers-filesDecorator", () => {
  let server: Server | undefined;
  const port = 3008;
  const serverAddress = `http://localhost:${port}`;
  const logger = bootstrapLoggerFactory("debug");

  beforeEach(async () => {
    await disposeAsync();
  });

  afterEach(async () => {
    await disposeAsync();
  });

  it("The @files decorator can inject the entire form files into the controller's method parameters", async () => {
    @controller("test")
    class TestController {
      @httpPost("files")
      find(@files() files: FormFiles) {
        logger.debug("received post");

        console.log("files", files);

        expect(files["file1"]).toBeTruthy();
        expect(files["file1"]).toBeInstanceOf(FormFile);

        expect(files["file2"]).toBeTruthy();
        expect(files["file2"]).toBeInstanceOf(FormFile);

        expect(Array.isArray(files["file3&4"])).toBeTruthy();
        expect((files["file3&4"] as FormFile[])[0]).toBeInstanceOf(FormFile);
        expect((files["file3&4"] as FormFile[])[1]).toBeInstanceOf(FormFile);
      }
    }

    server = await new ExpressAppBuilder({ port })
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

    await axios.post(`${serverAddress}/test/files`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    logger.debug("posted!");
  });

  async function disposeAsync() {
    server?.close();
  }
});
