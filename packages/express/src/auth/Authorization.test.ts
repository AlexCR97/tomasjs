import "reflect-metadata";
import { afterEach, beforeEach, describe, it } from "@jest/globals";
import { Logger, ServiceContainerBuilder } from "@tomasjs/core";
import { AppBuilder } from "@/builder";
import { controller, httpGet } from "@/controllers";
import { TestContext } from "@/tests";
import { OkResponse } from "@/responses";
import { statusCodes } from "@/core";
import { JwtSigner } from "./jwt";
import { Authorization, AuthorizationOptions } from "./Authorization";
import { Policy, RoleRequirement } from "./policies";
import { Authentication } from "./Authentication";

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

  /* #region Controllers */

  it("Can bootstrap authorization into controller using options", async () => {
    const policy = "TestPolicy";
    const role = "admin";

    const secret = "superDuperSecretValue";
    const accessToken = new JwtSigner({ secret }).sign({ role: role });

    @controller("/", {
      authenticate: { scheme: "jwt" },
      authorize: { policy },
    })
    class TestController {
      @httpGet()
      get() {
        return new OkResponse();
      }
    }

    const container = await new ServiceContainerBuilder()
      .setup(new Authentication((options) => options.addJwtScheme({ secret })))
      .setup(
        new Authorization(
          new AuthorizationOptions([new Policy(policy, [new RoleRequirement(role)])])
        )
      )
      .buildContainerAsync();

    context.server = await new AppBuilder({ port, logger, container })
      .useControllers(TestController)
      .buildAsync();

    const unauthorizedResponse = await fetch(address);

    expect(unauthorizedResponse.status).toBe(statusCodes.unauthorized);

    const authorizedResponse = await fetch(address, {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    expect(authorizedResponse.status).toBe(statusCodes.ok);
  });

  it("Can bootstrap authorization into controller using policies", async () => {
    const policy = "TestPolicy";
    const role = "admin";

    const secret = "superDuperSecretValue";
    const accessToken = new JwtSigner({ secret }).sign({ role: role });

    @controller("/", {
      authenticate: { scheme: "jwt" },
      authorize: { policy },
    })
    class TestController {
      @httpGet()
      get() {
        return new OkResponse();
      }
    }

    const container = await new ServiceContainerBuilder()
      .setup(new Authentication((options) => options.addJwtScheme({ secret })))
      .setup(new Authorization([new Policy(policy, [new RoleRequirement(role)])]))
      .buildContainerAsync();

    context.server = await new AppBuilder({ port, logger, container })
      .useControllers(TestController)
      .buildAsync();

    const unauthorizedResponse = await fetch(address);

    expect(unauthorizedResponse.status).toBe(statusCodes.unauthorized);

    const authorizedResponse = await fetch(address, {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    expect(authorizedResponse.status).toBe(statusCodes.ok);
  });

  it("Can bootstrap authorization into controller using configuration callback and requirements", async () => {
    const policy = "TestPolicy";
    const role = "admin";

    const secret = "superDuperSecretValue";
    const accessToken = new JwtSigner({ secret }).sign({ role: role });

    @controller("/", {
      authenticate: { scheme: "jwt" },
      authorize: { policy },
    })
    class TestController {
      @httpGet()
      get() {
        return new OkResponse();
      }
    }

    const container = await new ServiceContainerBuilder()
      .setup(new Authentication((options) => options.addJwtScheme({ secret })))
      .setup(new Authorization((options) => options.addPolicy(policy, [new RoleRequirement(role)])))
      .buildContainerAsync();

    context.server = await new AppBuilder({ port, logger, container })
      .useControllers(TestController)
      .buildAsync();

    const unauthorizedResponse = await fetch(address);

    expect(unauthorizedResponse.status).toBe(statusCodes.unauthorized);

    const authorizedResponse = await fetch(address, {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    expect(authorizedResponse.status).toBe(statusCodes.ok);
  });

  it("Can bootstrap authorization into controller using configuration callbacks", async () => {
    const policy = "TestPolicy";
    const role = "admin";

    const secret = "superDuperSecretValue";
    const accessToken = new JwtSigner({ secret }).sign({ role: role });

    @controller("/", {
      authenticate: { scheme: "jwt" },
      authorize: { policy },
    })
    class TestController {
      @httpGet()
      get() {
        return new OkResponse();
      }
    }

    const container = await new ServiceContainerBuilder()
      .setup(new Authentication((options) => options.addJwtScheme({ secret })))
      .setup(new Authorization((o) => o.addPolicy(policy, (r) => r.requireRole(role))))
      .buildContainerAsync();

    context.server = await new AppBuilder({ port, logger, container })
      .useControllers(TestController)
      .buildAsync();

    const unauthorizedResponse = await fetch(address);

    expect(unauthorizedResponse.status).toBe(statusCodes.unauthorized);

    const authorizedResponse = await fetch(address, {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    expect(authorizedResponse.status).toBe(statusCodes.ok);
  });

  /* #endregion */

  /* #region Controller Methods */

  it("Can bootstrap authorization into controller method using options", async () => {
    const policy = "TestPolicy";
    const role = "admin";

    const secret = "superDuperSecretValue";
    const accessToken = new JwtSigner({ secret }).sign({ role: role });

    @controller()
    class TestController {
      @httpGet("method", { authenticate: { scheme: "jwt" }, authorize: { policy } })
      get() {
        return new OkResponse();
      }
    }

    const container = await new ServiceContainerBuilder()
      .setup(new Authentication((options) => options.addJwtScheme({ secret })))
      .setup(
        new Authorization(
          new AuthorizationOptions([new Policy(policy, [new RoleRequirement(role)])])
        )
      )
      .buildContainerAsync();

    context.server = await new AppBuilder({ port, logger, container })
      .useControllers(TestController)
      .buildAsync();

    const unauthorizedResponse = await fetch(`${address}/method`);

    expect(unauthorizedResponse.status).toBe(statusCodes.unauthorized);

    const authorizedResponse = await fetch(`${address}/method`, {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    expect(authorizedResponse.status).toBe(statusCodes.ok);
  });

  it("Can bootstrap authorization into controller method using policies", async () => {
    const policy = "TestPolicy";
    const role = "admin";

    const secret = "superDuperSecretValue";
    const accessToken = new JwtSigner({ secret }).sign({ role: role });

    @controller()
    class TestController {
      @httpGet("method", { authenticate: { scheme: "jwt" }, authorize: { policy } })
      get() {
        return new OkResponse();
      }
    }

    const container = await new ServiceContainerBuilder()
      .setup(new Authentication((options) => options.addJwtScheme({ secret })))
      .setup(new Authorization([new Policy(policy, [new RoleRequirement(role)])]))
      .buildContainerAsync();

    context.server = await new AppBuilder({ port, logger, container })
      .useControllers(TestController)
      .buildAsync();

    const unauthorizedResponse = await fetch(`${address}/method`);

    expect(unauthorizedResponse.status).toBe(statusCodes.unauthorized);

    const authorizedResponse = await fetch(`${address}/method`, {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    expect(authorizedResponse.status).toBe(statusCodes.ok);
  });

  it("Can bootstrap authorization into controller method using configuration callback and requirements", async () => {
    const policy = "TestPolicy";
    const role = "admin";

    const secret = "superDuperSecretValue";
    const accessToken = new JwtSigner({ secret }).sign({ role: role });

    @controller()
    class TestController {
      @httpGet("method", { authenticate: { scheme: "jwt" }, authorize: { policy } })
      get() {
        return new OkResponse();
      }
    }

    const container = await new ServiceContainerBuilder()
      .setup(new Authentication((options) => options.addJwtScheme({ secret })))
      .setup(new Authorization((options) => options.addPolicy(policy, [new RoleRequirement(role)])))
      .buildContainerAsync();

    context.server = await new AppBuilder({ port, logger, container })
      .useControllers(TestController)
      .buildAsync();

    const unauthorizedResponse = await fetch(`${address}/method`);

    expect(unauthorizedResponse.status).toBe(statusCodes.unauthorized);

    const authorizedResponse = await fetch(`${address}/method`, {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    expect(authorizedResponse.status).toBe(statusCodes.ok);
  });

  it("Can bootstrap authorization into controller method using configuration callbacks", async () => {
    const policy = "TestPolicy";
    const role = "admin";

    const secret = "superDuperSecretValue";
    const accessToken = new JwtSigner({ secret }).sign({ role: role });

    @controller()
    class TestController {
      @httpGet("method", { authenticate: { scheme: "jwt" }, authorize: { policy } })
      get() {
        return new OkResponse();
      }
    }

    const container = await new ServiceContainerBuilder()
      .setup(new Authentication((options) => options.addJwtScheme({ secret })))
      .setup(new Authorization((o) => o.addPolicy(policy, (r) => r.requireRole(role))))
      .buildContainerAsync();

    context.server = await new AppBuilder({ port, logger, container })
      .useControllers(TestController)
      .buildAsync();

    const unauthorizedResponse = await fetch(`${address}/method`);

    expect(unauthorizedResponse.status).toBe(statusCodes.unauthorized);

    const authorizedResponse = await fetch(`${address}/method`, {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    expect(authorizedResponse.status).toBe(statusCodes.ok);
  });

  /* #endregion */

  /* #region Endpoints */

  it("Can bootstrap authorization into endpoint using options", async () => {
    const policy = "TestPolicy";
    const role = "admin";

    const secret = "superDuperSecretValue";
    const accessToken = new JwtSigner({ secret }).sign({ role: role });

    const container = await new ServiceContainerBuilder()
      .setup(new Authentication((options) => options.addJwtScheme({ secret })))
      .setup(
        new Authorization(
          new AuthorizationOptions([new Policy(policy, [new RoleRequirement(role)])])
        )
      )
      .buildContainerAsync();

    context.server = await new AppBuilder({ port, logger, container })
      .useGet("endpoint", () => new OkResponse(), {
        authenticate: { scheme: "jwt" },
        authorize: { policy },
      })
      .buildAsync();

    const unauthorizedResponse = await fetch(`${address}/endpoint`);

    expect(unauthorizedResponse.status).toBe(statusCodes.unauthorized);

    const authorizedResponse = await fetch(`${address}/endpoint`, {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    expect(authorizedResponse.status).toBe(statusCodes.ok);
  });

  it("Can bootstrap authorization into endpoint using policies", async () => {
    const policy = "TestPolicy";
    const role = "admin";

    const secret = "superDuperSecretValue";
    const accessToken = new JwtSigner({ secret }).sign({ role: role });

    const container = await new ServiceContainerBuilder()
      .setup(new Authentication((options) => options.addJwtScheme({ secret })))
      .setup(new Authorization([new Policy(policy, [new RoleRequirement(role)])]))
      .buildContainerAsync();

    context.server = await new AppBuilder({ port, logger, container })
      .useGet("endpoint", () => new OkResponse(), {
        authenticate: { scheme: "jwt" },
        authorize: { policy },
      })
      .buildAsync();

    const unauthorizedResponse = await fetch(`${address}/endpoint`);

    expect(unauthorizedResponse.status).toBe(statusCodes.unauthorized);

    const authorizedResponse = await fetch(`${address}/endpoint`, {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    expect(authorizedResponse.status).toBe(statusCodes.ok);
  });

  it("Can bootstrap authorization into endpoint using configuration callback and requirements", async () => {
    const policy = "TestPolicy";
    const role = "admin";

    const secret = "superDuperSecretValue";
    const accessToken = new JwtSigner({ secret }).sign({ role: role });

    const container = await new ServiceContainerBuilder()
      .setup(new Authentication((options) => options.addJwtScheme({ secret })))
      .setup(new Authorization((options) => options.addPolicy(policy, [new RoleRequirement(role)])))
      .buildContainerAsync();

    context.server = await new AppBuilder({ port, logger, container })
      .useGet("endpoint", () => new OkResponse(), {
        authenticate: { scheme: "jwt" },
        authorize: { policy },
      })
      .buildAsync();

    const unauthorizedResponse = await fetch(`${address}/endpoint`);

    expect(unauthorizedResponse.status).toBe(statusCodes.unauthorized);

    const authorizedResponse = await fetch(`${address}/endpoint`, {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    expect(authorizedResponse.status).toBe(statusCodes.ok);
  });

  it("Can bootstrap authorization into endpoint using configuration callbacks", async () => {
    const policy = "TestPolicy";
    const role = "admin";

    const secret = "superDuperSecretValue";
    const accessToken = new JwtSigner({ secret }).sign({ role: role });

    const container = await new ServiceContainerBuilder()
      .setup(new Authentication((options) => options.addJwtScheme({ secret })))
      .setup(new Authorization((o) => o.addPolicy(policy, (r) => r.requireRole(role))))
      .buildContainerAsync();

    context.server = await new AppBuilder({ port, logger, container })
      .useGet("endpoint", () => new OkResponse(), {
        authenticate: { scheme: "jwt" },
        authorize: { policy },
      })
      .buildAsync();

    const unauthorizedResponse = await fetch(`${address}/endpoint`);

    expect(unauthorizedResponse.status).toBe(statusCodes.unauthorized);

    const authorizedResponse = await fetch(`${address}/endpoint`, {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    expect(authorizedResponse.status).toBe(statusCodes.ok);
  });

  /* #endregion */
});
