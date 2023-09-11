import "reflect-metadata";
import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import axios from "axios";
import { AppBuilder } from "./AppBuilder";
import { statusCodes } from "@/core";
import { TestContext } from "@/tests";
import { Logger } from "@tomasjs/core";

const testSuiteName = "builder/useCorePipeline";

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

  it(`Should bind the request user`, (done) => {
    new AppBuilder({ port, logger })
      .use((app) => {
        app.use((req, res) => {
          expect(req.user).toBeTruthy();
          expect(req.user.authenticated).toBe(false);
          expect(req.user.authorized).toBe(false);
          expect(req.user.claims).toBeNull();
          done();
          return res.status(statusCodes.ok).send();
        });
      })
      .buildAsync()
      .then(async (server) => {
        context.server = server;
        await axios.get(address);
      });
  });
});
