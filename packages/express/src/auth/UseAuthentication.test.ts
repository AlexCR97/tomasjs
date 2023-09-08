import "reflect-metadata";
import { afterEach, beforeEach, describe, it } from "@jest/globals";
import { Logger } from "@tomasjs/core";
import { ExpressAppBuilder } from "@/builder";
import { UseControllers, controller, httpGet } from "@/controllers";
import { TestContext } from "@/tests";
import { UseAuthentication } from "./UseAuthentication";
import { OkResponse } from "@/responses";
import { statusCodes } from "@/core";
import { JwtSigner } from "./jwt";

const testSuiteName = "auth/UseAuthentication";

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

  it("Can bootstrap authentication", async () => {
    const secret = "superDuperSecretValue";
    const accessToken = JwtSigner.sign({ foo: "bar" }, secret);

    @controller()
    class TestController {
      @httpGet()
      get() {
        return new OkResponse();
      }
    }

    context.server = await new ExpressAppBuilder({ port, logger })
      .use(
        new UseAuthentication({
          authenticationScheme: "jwt",
          jwtVerifyOptions: {
            secret,
          },
        })
      )
      .use(
        new UseControllers({
          controllers: [TestController],
          logger,
        })
      )
      .buildAsync();

    const response = await fetch(address, {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    expect(response.status).toBe(statusCodes.ok);
  });
});
