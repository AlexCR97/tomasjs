import "reflect-metadata";
import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { GuardFunction } from "./GuardFunction";
import { UseGuards } from "./UseGuards";
import { Guard } from "./Guard";
import { GuardContext } from "./GuardContext";
import { Logger, ServiceContainerBuilder, TomasLogger, injectable } from "@tomasjs/core";
import { GuardFactory } from "./GuardFactory";
import { TestContext } from "@/tests";
import { UseControllers, controller, httpGet } from "@/controllers";
import { ExpressAppBuilder } from "@/builder";
import axios from "axios";
import { ForbiddenResponse, OkResponse, UnauthorizedResponse } from "@/responses";
import { statusCodes } from "@/core";
import fetch from "node-fetch";

const testSuiteName = "guards/UseGuards";

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

  it("Can bootstrap GuardFunctions", (done) => {
    const collectedData: number[] = [];

    const firstGuard: GuardFunction = (context) => {
      collectedData.push(1);
      return true;
    };

    const secondGuard: GuardFunction = (context) => {
      collectedData.push(2);
      return true;
    };

    @controller()
    class TestController {
      @httpGet()
      get() {
        expect(collectedData.length).toBe(2);
        expect(collectedData[0]).toBe(1);
        expect(collectedData[1]).toBe(2);
        done();
      }
    }

    new ExpressAppBuilder({ port, logger })
      .use(
        new UseGuards({
          guards: [firstGuard, secondGuard],
          logger,
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

  it("Can bootstrap Guard instances", (done) => {
    const collectedData: number[] = [];

    class FirstGuard implements Guard {
      isAllowed(context: GuardContext) {
        collectedData.push(1);
        return true;
      }
    }

    class SecondGuard implements Guard {
      isAllowed(context: GuardContext) {
        collectedData.push(2);
        return true;
      }
    }

    @controller()
    class TestController {
      @httpGet()
      get() {
        expect(collectedData.length).toBe(2);
        expect(collectedData[0]).toBe(1);
        expect(collectedData[1]).toBe(2);
        done();
      }
    }

    new ExpressAppBuilder({ port, logger })
      .use(
        new UseGuards({
          guards: [new FirstGuard(), new SecondGuard()],
          logger,
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

  it("Can bootstrap Guard constructors", (done) => {
    const collectedData: number[] = [];

    @injectable()
    class FirstGuard implements Guard {
      isAllowed(context: GuardContext) {
        collectedData.push(1);
        return true;
      }
    }

    @injectable()
    class SecondGuard implements Guard {
      isAllowed(context: GuardContext) {
        collectedData.push(2);
        return true;
      }
    }

    @controller()
    class TestController {
      @httpGet()
      get() {
        expect(collectedData.length).toBe(2);
        expect(collectedData[0]).toBe(1);
        expect(collectedData[1]).toBe(2);
        done();
      }
    }

    new ServiceContainerBuilder()
      .addClass(FirstGuard)
      .addClass(SecondGuard)
      .buildContainerAsync()
      .then((container) => {
        new ExpressAppBuilder({ port, logger, container })
          .use(
            new UseGuards({
              guards: [FirstGuard, SecondGuard],
              logger,
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

  it("Can bootstrap GuardFactories that return a GuardFunction", (done) => {
    const collectedData: number[] = [];

    const firstGuard: GuardFunction = (context) => {
      collectedData.push(1);
      return true;
    };

    const secondGuard: GuardFunction = (context) => {
      collectedData.push(2);
      return true;
    };

    class FirstGuardFactory implements GuardFactory {
      create() {
        return firstGuard;
      }
    }

    class SecondGuardFactory implements GuardFactory {
      create() {
        return secondGuard;
      }
    }

    @controller()
    class TestController {
      @httpGet()
      get() {
        expect(collectedData.length).toBe(2);
        expect(collectedData[0]).toBe(1);
        expect(collectedData[1]).toBe(2);
        done();
      }
    }

    new ExpressAppBuilder({ port, logger })
      .use(
        new UseGuards({
          guards: [new FirstGuardFactory(), new SecondGuardFactory()],
          logger,
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

  it("Can bootstrap GuardFactories that return a Guard instance", (done) => {
    const collectedData: number[] = [];

    class FirstGuard implements Guard {
      isAllowed(context: GuardContext) {
        collectedData.push(1);
        return true;
      }
    }

    class SecondGuard implements Guard {
      isAllowed(context: GuardContext) {
        collectedData.push(2);
        return true;
      }
    }

    class FirstGuardFactory implements GuardFactory {
      create() {
        return new FirstGuard();
      }
    }

    class SecondGuardFactory implements GuardFactory {
      create() {
        return new SecondGuard();
      }
    }

    @controller()
    class TestController {
      @httpGet()
      get() {
        expect(collectedData.length).toBe(2);
        expect(collectedData[0]).toBe(1);
        expect(collectedData[1]).toBe(2);
        done();
      }
    }

    new ExpressAppBuilder({ port, logger })
      .use(
        new UseGuards({
          guards: [new FirstGuardFactory(), new SecondGuardFactory()],
          logger,
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

  it("Can bootstrap GuardFactories that return a Guard constructor", (done) => {
    const collectedData: number[] = [];

    @injectable()
    class FirstGuard implements Guard {
      isAllowed(context: GuardContext) {
        collectedData.push(1);
        return true;
      }
    }

    @injectable()
    class SecondGuard implements Guard {
      isAllowed(context: GuardContext) {
        collectedData.push(2);
        return true;
      }
    }

    class FirstGuardFactory implements GuardFactory {
      create() {
        return FirstGuard;
      }
    }

    class SecondGuardFactory implements GuardFactory {
      create() {
        return SecondGuard;
      }
    }

    @controller()
    class TestController {
      @httpGet()
      get() {
        expect(collectedData.length).toBe(2);
        expect(collectedData[0]).toBe(1);
        expect(collectedData[1]).toBe(2);
        done();
      }
    }

    new ServiceContainerBuilder()
      .addClass(FirstGuard)
      .addClass(SecondGuard)
      .buildContainerAsync()
      .then((container) => {
        new ExpressAppBuilder({ port, logger, container })
          .use(
            new UseGuards({
              guards: [new FirstGuardFactory(), new SecondGuardFactory()],
              logger,
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

  it("The http pipeline will continue if a guard returns true", async () => {
    const guard: GuardFunction = (context) => {
      return true;
    };

    @controller()
    class TestController {
      @httpGet()
      get() {
        return new OkResponse();
      }
    }

    context.server = await new ExpressAppBuilder({ port, logger })
      .use(
        new UseGuards({
          guards: [guard],
        })
      )
      .use(new UseControllers({ controllers: [TestController], logger }))
      .buildAsync();

    const response = await fetch(`${address}`);
    expect(response.status).toBe(statusCodes.ok);
  });

  it("The server will respond with a 401 unauthorized if a guard returns false", async () => {
    const port = 3013;
    const address = `http://localhost:${port}`;
    const logger = new TomasLogger("test", "error");

    const guard: GuardFunction = (context) => {
      return false;
    };

    @controller()
    class TestController {
      @httpGet()
      get() {
        return new OkResponse();
      }
    }

    context.server = await new ExpressAppBuilder({ port, logger })
      .use(
        new UseGuards({
          guards: [guard],
          logger,
        })
      )
      .use(new UseControllers({ controllers: [TestController], logger }))
      .buildAsync();

    const response = await fetch(`${address}`);
    expect(response.status).toBe(statusCodes.unauthorized);
  });

  it("The server will respond with a 401 unauthorized if a guard returns an UnauthorizedResponse instance", async () => {
    const port = 3014;
    const address = `http://localhost:${port}`;
    const logger = new TomasLogger("test", "error");

    const guard: GuardFunction = (context) => {
      return new UnauthorizedResponse();
    };

    @controller()
    class TestController {
      @httpGet()
      get() {
        return new OkResponse();
      }
    }

    context.server = await new ExpressAppBuilder({ port, logger })
      .use(
        new UseGuards({
          guards: [guard],
          logger,
        })
      )
      .use(new UseControllers({ controllers: [TestController], logger }))
      .buildAsync();

    const response = await fetch(`${address}`);
    expect(response.status).toBe(statusCodes.unauthorized);
  });

  it("The server will respond with a 403 forbidden if a guard returns a ForbiddenResponse instance", async () => {
    const port = 3015;
    const address = `http://localhost:${port}`;
    const logger = new TomasLogger("test", "error");

    const guard: GuardFunction = (context) => {
      return new ForbiddenResponse();
    };

    @controller()
    class TestController {
      @httpGet()
      get() {
        return new OkResponse();
      }
    }

    context.server = await new ExpressAppBuilder({ port, logger })
      .use(
        new UseGuards({
          guards: [guard],
          logger,
        })
      )
      .use(new UseControllers({ controllers: [TestController], logger }))
      .buildAsync();

    const response = await fetch(`${address}`);
    expect(response.status).toBe(statusCodes.forbidden);
  });

  it("An app-level guard will be applied to all endpoints", async () => {
    const port = 3016;
    const address = `http://localhost:${port}`;
    const logger = new TomasLogger("test", "error");

    const collectedData: number[] = [];

    const guard: GuardFunction = (context) => {
      const currentCount = collectedData.length;
      collectedData.push(currentCount + 1);
      return true;
    };

    @controller("first")
    class FirstController {
      @httpGet()
      get() {
        return new OkResponse();
      }
    }

    @controller("second")
    class SecondController {
      @httpGet()
      get() {
        return new OkResponse();
      }
    }

    @controller("third")
    class ThirdController {
      @httpGet()
      get() {
        return new OkResponse();
      }
    }

    context.server = await new ExpressAppBuilder({ port, logger })
      .use(
        new UseGuards({
          guards: [guard],
          logger,
        })
      )
      .use(
        new UseControllers({
          controllers: [FirstController, SecondController, ThirdController],
          logger,
        })
      )
      .buildAsync();

    const firstResponse = await fetch(`${address}/first`);
    expect(firstResponse.status).toBe(statusCodes.ok);

    const secondResponse = await fetch(`${address}/second`);
    expect(secondResponse.status).toBe(statusCodes.ok);

    const thirdResponse = await fetch(`${address}/third`);
    expect(thirdResponse.status).toBe(statusCodes.ok);

    expect(collectedData.length).toBe(3);
  });
});
