import "reflect-metadata";
import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { Logger } from "@tomasjs/core";
import { AppBuilder } from "@/builder";
import { UseControllers, controller, headers, httpGet } from "@/controllers";
import { TestContext } from "@/tests";
import axios from "axios";
import { InterceptorFunction } from "./InterceptorFunction";
import { UseInterceptors } from "./UseInterceptors";
import { IdentityClaim, RequestHeaders } from "@/core";
import { GuardFunction, UseGuards } from "@/guards";
import { OkResponse } from "..";

const testSuiteName = "interceptors/UseInterceptors";

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

  it("Can bootstrap InterceptorFunctions", (done) => {
    const firstInterceptor: InterceptorFunction = ({ request, user }) => {
      request.setHeader("firstInterceptor", "1");
    };

    const secondInterceptor: InterceptorFunction = ({ request }) => {
      request.setHeader("secondInterceptor", "2");
    };

    @controller()
    class TestController {
      @httpGet()
      get(@headers() headers: RequestHeaders) {
        expect(headers["firstInterceptor"]).toBe("1");
        expect(headers["secondInterceptor"]).toBe("2");
        done();
      }
    }

    new AppBuilder({ port, logger })
      .use(
        new UseInterceptors({
          interceptors: [firstInterceptor, secondInterceptor],
        })
      )
      .use(
        new UseControllers({
          controllers: [TestController],
          logger,
        })
      )
      .buildAsync()
      .then((server) => {
        context.server = server;
        axios.get(address);
      });
  });

  it("Can use interceptor to authenticate and authorize", async () => {
    const claimKey = "id";
    const claimValue = "someUserId";

    const authInterceptor: InterceptorFunction = ({ request, user }) => {
      user.authenticate([{ key: claimKey, value: claimValue }]).authorize();
    };

    const authGuard: GuardFunction = ({ user }) => {
      expect(user.authenticated).toBeTruthy();
      expect(user.authorized).toBeTruthy();
      expect(user.claims).toContainEqual(<IdentityClaim>{ key: claimKey, value: claimValue });

      return (
        user.authenticated &&
        user.authorized &&
        user.hasClaim((x) => x.key === claimKey && x.value === claimValue)
      );
    };

    @controller()
    class TestController {
      @httpGet()
      get() {
        return new OkResponse();
      }
    }

    context.server = await new AppBuilder({ port })
      .use(
        new UseInterceptors({
          interceptors: [authInterceptor],
        })
      )
      .use(
        new UseGuards({
          guards: [authGuard],
        })
      )
      .use(
        new UseControllers({
          controllers: [TestController],
          logger,
        })
      )
      .buildAsync();

    await axios.get(address);
  });
});
