import "reflect-metadata";
import { afterEach, beforeEach, describe, it } from "@jest/globals";
import { Logger } from "@tomasjs/core";
import { AppBuilder } from "@/builder";
import { controller, httpGet } from "@/controllers";
import { TestContext } from "@/tests";
import { OkResponse } from "@/responses";
import { statusCodes } from "@/core";
import { JwtSigner } from "./jwt";

const testSuiteName = "auth/UseAuthorization";

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

  it("Can bootstrap authorization", async () => {
    const secret = "superDuperSecretValue";
    const accessToken = new JwtSigner({ secret }).sign({ role: "admin" });

    @controller()
    class TestController {
      @httpGet()
      get() {
        return new OkResponse();
      }
    }

    context.server = await new AppBuilder({ port, logger })
      .useAuthentication({
        authenticationScheme: "jwt",
        jwtDecoderOptions: {
          secret,
        },
      })
      .useAuthorization([
        {
          key: "role",
          value: "admin",
        },
      ])
      .useControllers(TestController)
      .buildAsync();

    const response = await fetch(address, {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    expect(response.status).toBe(statusCodes.ok);
  });
});
