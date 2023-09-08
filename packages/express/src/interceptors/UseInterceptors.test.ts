import "reflect-metadata";
import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { Logger } from "@tomasjs/core";
import { ExpressAppBuilder } from "@/builder";
import { UseControllers, controller, headers, httpGet } from "@/controllers";
import { TestContext } from "@/tests";
import axios from "axios";
import { InterceptorFunction } from "./InterceptorFunction";
import { UseInterceptors } from "./UseInterceptors";
import { RequestHeaders } from "@/core";

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

    new ExpressAppBuilder({ port, logger })
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
});
