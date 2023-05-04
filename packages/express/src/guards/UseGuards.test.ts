import "reflect-metadata";
import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { bootstrapLoggerFactory } from "@tomasjs/logging";
import { Server } from "http";
import fetch from "node-fetch";
import { UseControllers, controller, httpGet } from "../controllers";
import { ExpressAppBuilder } from "../builder";
import { GuardFunction } from "./GuardFunction";
import { UseGuards } from "./UseGuards";
import { Guard } from "./Guard";
import { GuardContext } from "./GuardContext";
import { ServiceContainerBuilder, injectable } from "@tomasjs/core";
import { GuardFactory } from "./GuardFactory";
import { ForbiddenResponse, OkResponse, UnauthorizedResponse } from "../responses/status-codes";
import { statusCodes } from "../core";

describe("guards-UseGuards", () => {
  let server: Server | undefined;
  const port = 3012;
  const serverAddress = `http://localhost:${port}`;
  const logger = bootstrapLoggerFactory("error");

  beforeEach(async () => {
    await disposeAsync();
  });

  afterEach(async () => {
    await disposeAsync();
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

    //@ts-ignore TODO Fix decorators not working in test files
    @controller()
    class TestController {
      //@ts-ignore TODO Fix decorators not working in test files
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
      .then((expressServer) => {
        server = expressServer;
        fetch(serverAddress);
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

    //@ts-ignore TODO Fix decorators not working in test files
    @controller()
    class TestController {
      //@ts-ignore TODO Fix decorators not working in test files
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
      .then((expressServer) => {
        server = expressServer;
        fetch(serverAddress);
      });
  });

  it("Can bootstrap Guard constructors", (done) => {
    const collectedData: number[] = [];

    //@ts-ignore TODO Fix decorators not working in test files
    @injectable()
    class FirstGuard implements Guard {
      isAllowed(context: GuardContext) {
        collectedData.push(1);
        return true;
      }
    }

    //@ts-ignore TODO Fix decorators not working in test files
    @injectable()
    class SecondGuard implements Guard {
      isAllowed(context: GuardContext) {
        collectedData.push(2);
        return true;
      }
    }

    //@ts-ignore TODO Fix decorators not working in test files
    @controller()
    class TestController {
      //@ts-ignore TODO Fix decorators not working in test files
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
          .then((expressServer) => {
            server = expressServer;
            fetch(serverAddress);
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

    //@ts-ignore TODO Fix decorators not working in test files
    @controller()
    class TestController {
      //@ts-ignore TODO Fix decorators not working in test files
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
      .then((expressServer) => {
        server = expressServer;
        fetch(serverAddress);
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

    //@ts-ignore TODO Fix decorators not working in test files
    @controller()
    class TestController {
      //@ts-ignore TODO Fix decorators not working in test files
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
      .then((expressServer) => {
        server = expressServer;
        fetch(serverAddress);
      });
  });

  it("Can bootstrap GuardFactories that return a Guard constructor", (done) => {
    const collectedData: number[] = [];

    //@ts-ignore TODO Fix decorators not working in test files
    @injectable()
    class FirstGuard implements Guard {
      isAllowed(context: GuardContext) {
        collectedData.push(1);
        return true;
      }
    }

    //@ts-ignore TODO Fix decorators not working in test files
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

    //@ts-ignore TODO Fix decorators not working in test files
    @controller()
    class TestController {
      //@ts-ignore TODO Fix decorators not working in test files
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
          .then((expressServer) => {
            server = expressServer;
            fetch(serverAddress);
          });
      });
  });

  it("The http pipeline will continue if a guard returns true", async () => {
    const guard: GuardFunction = (context) => {
      return true;
    };

    //@ts-ignore TODO Fix decorators not working in test files
    @controller()
    class TestController {
      //@ts-ignore TODO Fix decorators not working in test files
      @httpGet()
      get() {
        return new OkResponse();
      }
    }

    await new ExpressAppBuilder({ port, logger })
      .use(
        new UseGuards({
          guards: [guard],
        })
      )
      .use(new UseControllers({ controllers: [TestController], logger }))
      .buildAsync();

    const response = await fetch(`${serverAddress}`);
    expect(response.status).toBe(statusCodes.ok);
  });

  it("The server will respond with a 401 unauthorized if a guard returns false", async () => {
    const port = 3013;
    const serverAddress = `http://localhost:${port}`;
    const logger = bootstrapLoggerFactory("error");

    const guard: GuardFunction = (context) => {
      return false;
    };

    //@ts-ignore TODO Fix decorators not working in test files
    @controller()
    class TestController {
      //@ts-ignore TODO Fix decorators not working in test files
      @httpGet()
      get() {
        return new OkResponse();
      }
    }

    await new ExpressAppBuilder({ port, logger })
      .use(
        new UseGuards({
          guards: [guard],
          logger,
        })
      )
      .use(new UseControllers({ controllers: [TestController], logger }))
      .buildAsync();

    const response = await fetch(`${serverAddress}`);
    expect(response.status).toBe(statusCodes.unauthorized);
  });

  it("The server will respond with a 401 unauthorized if a guard returns an UnauthorizedResponse instance", async () => {
    const port = 3014;
    const serverAddress = `http://localhost:${port}`;
    const logger = bootstrapLoggerFactory("error");

    const guard: GuardFunction = (context) => {
      return new UnauthorizedResponse();
    };

    //@ts-ignore TODO Fix decorators not working in test files
    @controller()
    class TestController {
      //@ts-ignore TODO Fix decorators not working in test files
      @httpGet()
      get() {
        return new OkResponse();
      }
    }

    await new ExpressAppBuilder({ port, logger })
      .use(
        new UseGuards({
          guards: [guard],
          logger,
        })
      )
      .use(new UseControllers({ controllers: [TestController], logger }))
      .buildAsync();

    const response = await fetch(`${serverAddress}`);
    expect(response.status).toBe(statusCodes.unauthorized);
  });

  it("The server will respond with a 403 forbidden if a guard returns a ForbiddenResponse instance", async () => {
    const port = 3015;
    const serverAddress = `http://localhost:${port}`;
    const logger = bootstrapLoggerFactory("error");

    const guard: GuardFunction = (context) => {
      return new ForbiddenResponse();
    };

    //@ts-ignore TODO Fix decorators not working in test files
    @controller()
    class TestController {
      //@ts-ignore TODO Fix decorators not working in test files
      @httpGet()
      get() {
        return new OkResponse();
      }
    }

    await new ExpressAppBuilder({ port, logger })
      .use(
        new UseGuards({
          guards: [guard],
          logger,
        })
      )
      .use(new UseControllers({ controllers: [TestController], logger }))
      .buildAsync();

    const response = await fetch(`${serverAddress}`);
    expect(response.status).toBe(statusCodes.forbidden);
  });

  async function disposeAsync() {
    server?.close();
  }
});
