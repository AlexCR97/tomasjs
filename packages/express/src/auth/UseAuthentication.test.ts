import "reflect-metadata";
import { afterEach, beforeEach, describe, it } from "@jest/globals";
import { Logger, ServiceContainerBuilder } from "@tomasjs/core";
import { AppBuilder } from "@/builder";
import { controller, httpGet } from "@/controllers";
import { TestContext } from "@/tests";
import { OkResponse } from "@/responses";
import { statusCodes } from "@/core";
import { JwtInterceptor, JwtSigner } from "./jwt";
import { Authentication, AuthenticationOptions } from "./Authentication";

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

  /* #region Controllers */

  it("Can bootstrap authentication into controller using schemes", async () => {
    const secret = "superDuperSecretValue";
    const accessToken = new JwtSigner({ secret }).sign({ foo: "bar" });

    @controller("/", { authenticate: { scheme: "jwt" } })
    class TestController {
      @httpGet()
      get() {
        return new OkResponse();
      }
    }

    const container = await new ServiceContainerBuilder()
      .setup(new Authentication([{ scheme: "jwt", interceptor: new JwtInterceptor({ secret }) }]))
      .buildContainerAsync();

    context.server = await new AppBuilder({ port, logger, container })
      .useControllers(TestController)
      .buildAsync();

    const unauthenticatedResponse = await fetch(address);

    expect(unauthenticatedResponse.status).toBe(statusCodes.unauthorized);

    const authenticatedResponse = await fetch(address, {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    expect(authenticatedResponse.status).toBe(statusCodes.ok);
  });

  it("Can bootstrap authentication into controller using options", async () => {
    const secret = "superDuperSecretValue";
    const accessToken = new JwtSigner({ secret }).sign({ foo: "bar" });

    @controller("/", { authenticate: { scheme: "jwt" } })
    class TestController {
      @httpGet()
      get() {
        return new OkResponse();
      }
    }

    const container = await new ServiceContainerBuilder()
      .setup(
        new Authentication(
          new AuthenticationOptions([
            { scheme: "jwt", interceptor: new JwtInterceptor({ secret }) },
          ])
        )
      )
      .buildContainerAsync();

    context.server = await new AppBuilder({ port, logger, container })
      .useControllers(TestController)
      .buildAsync();

    const unauthenticatedResponse = await fetch(address);

    expect(unauthenticatedResponse.status).toBe(statusCodes.unauthorized);

    const authenticatedResponse = await fetch(address, {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    expect(authenticatedResponse.status).toBe(statusCodes.ok);
  });

  it("Can bootstrap authentication into controller using configuration callback", async () => {
    const secret = "superDuperSecretValue";
    const accessToken = new JwtSigner({ secret }).sign({ foo: "bar" });

    @controller("/", { authenticate: { scheme: "jwt" } })
    class TestController {
      @httpGet()
      get() {
        return new OkResponse();
      }
    }

    const container = await new ServiceContainerBuilder()
      .setup(new Authentication((options) => options.addJwtScheme({ secret })))
      .buildContainerAsync();

    context.server = await new AppBuilder({ port, logger, container })
      .useControllers(TestController)
      .buildAsync();

    const unauthenticatedResponse = await fetch(address);

    expect(unauthenticatedResponse.status).toBe(statusCodes.unauthorized);

    const authenticatedResponse = await fetch(address, {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    expect(authenticatedResponse.status).toBe(statusCodes.ok);
  });

  /* #endregion */

  /* #region Controller Methods */

  it("Can bootstrap authentication into controller method using schemes", async () => {
    const secret = "superDuperSecretValue";
    const accessToken = new JwtSigner({ secret }).sign({ foo: "bar" });

    @controller()
    class TestController {
      @httpGet("method", { authenticate: { scheme: "jwt" } })
      get() {
        return new OkResponse();
      }
    }

    const container = await new ServiceContainerBuilder()
      .setup(new Authentication([{ scheme: "jwt", interceptor: new JwtInterceptor({ secret }) }]))
      .buildContainerAsync();

    context.server = await new AppBuilder({ port, logger, container })
      .useControllers(TestController)
      .buildAsync();

    const unauthenticatedResponse = await fetch(`${address}/method`);

    expect(unauthenticatedResponse.status).toBe(statusCodes.unauthorized);

    const authenticatedResponse = await fetch(`${address}/method`, {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    expect(authenticatedResponse.status).toBe(statusCodes.ok);
  });

  it("Can bootstrap authentication into controller method using options", async () => {
    const secret = "superDuperSecretValue";
    const accessToken = new JwtSigner({ secret }).sign({ foo: "bar" });

    @controller()
    class TestController {
      @httpGet("method", { authenticate: { scheme: "jwt" } })
      get() {
        return new OkResponse();
      }
    }

    const container = await new ServiceContainerBuilder()
      .setup(
        new Authentication(
          new AuthenticationOptions([
            { scheme: "jwt", interceptor: new JwtInterceptor({ secret }) },
          ])
        )
      )
      .buildContainerAsync();

    context.server = await new AppBuilder({ port, logger, container })
      .useControllers(TestController)
      .buildAsync();

    const unauthenticatedResponse = await fetch(`${address}/method`);

    expect(unauthenticatedResponse.status).toBe(statusCodes.unauthorized);

    const authenticatedResponse = await fetch(`${address}/method`, {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    expect(authenticatedResponse.status).toBe(statusCodes.ok);
  });

  it("Can bootstrap authentication into controller method using configuration callback", async () => {
    const secret = "superDuperSecretValue";
    const accessToken = new JwtSigner({ secret }).sign({ foo: "bar" });

    @controller()
    class TestController {
      @httpGet("method", { authenticate: { scheme: "jwt" } })
      get() {
        return new OkResponse();
      }
    }

    const container = await new ServiceContainerBuilder()
      .setup(new Authentication((options) => options.addJwtScheme({ secret })))
      .buildContainerAsync();

    context.server = await new AppBuilder({ port, logger, container })
      .useControllers(TestController)
      .buildAsync();

    const unauthenticatedResponse = await fetch(`${address}/method`);

    expect(unauthenticatedResponse.status).toBe(statusCodes.unauthorized);

    const authenticatedResponse = await fetch(`${address}/method`, {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    expect(authenticatedResponse.status).toBe(statusCodes.ok);
  });

  /* #endregion */

  /* #region Endpoints */

  it("Can bootstrap authentication into endpoint using schemes", async () => {
    const secret = "superDuperSecretValue";
    const accessToken = new JwtSigner({ secret }).sign({ foo: "bar" });

    const container = await new ServiceContainerBuilder()
      .setup(new Authentication([{ scheme: "jwt", interceptor: new JwtInterceptor({ secret }) }]))
      .buildContainerAsync();

    context.server = await new AppBuilder({ port, logger, container })
      .useGet("endpoint", () => new OkResponse(), { authenticate: { scheme: "jwt" } })
      .buildAsync();

    const unauthenticatedResponse = await fetch(`${address}/endpoint`);

    expect(unauthenticatedResponse.status).toBe(statusCodes.unauthorized);

    const authenticatedResponse = await fetch(`${address}/endpoint`, {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    expect(authenticatedResponse.status).toBe(statusCodes.ok);
  });

  it("Can bootstrap authentication into endpoint using options", async () => {
    const secret = "superDuperSecretValue";
    const accessToken = new JwtSigner({ secret }).sign({ foo: "bar" });

    const container = await new ServiceContainerBuilder()
      .setup(
        new Authentication(
          new AuthenticationOptions([
            { scheme: "jwt", interceptor: new JwtInterceptor({ secret }) },
          ])
        )
      )
      .buildContainerAsync();

    context.server = await new AppBuilder({ port, logger, container })
      .useGet("endpoint", () => new OkResponse(), { authenticate: { scheme: "jwt" } })
      .buildAsync();

    const unauthenticatedResponse = await fetch(`${address}/endpoint`);

    expect(unauthenticatedResponse.status).toBe(statusCodes.unauthorized);

    const authenticatedResponse = await fetch(`${address}/endpoint`, {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    expect(authenticatedResponse.status).toBe(statusCodes.ok);
  });

  it("Can bootstrap authentication into endpoint using configuration callback", async () => {
    const secret = "superDuperSecretValue";
    const accessToken = new JwtSigner({ secret }).sign({ foo: "bar" });

    const container = await new ServiceContainerBuilder()
      .setup(new Authentication((options) => options.addJwtScheme({ secret })))
      .buildContainerAsync();

    context.server = await new AppBuilder({ port, logger, container })
      .useGet("endpoint", () => new OkResponse(), { authenticate: { scheme: "jwt" } })
      .buildAsync();

    const unauthenticatedResponse = await fetch(`${address}/endpoint`);

    expect(unauthenticatedResponse.status).toBe(statusCodes.unauthorized);

    const authenticatedResponse = await fetch(`${address}/endpoint`, {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    expect(authenticatedResponse.status).toBe(statusCodes.ok);
  });

  /* #endregion */
});
