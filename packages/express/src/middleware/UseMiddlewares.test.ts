import "reflect-metadata";
import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { ClassConstructor, Logger, ServiceContainerBuilder, injectable } from "@tomasjs/core";
import { AppBuilder } from "@/builder";
import { controller, httpGet } from "@/controllers";
import { HttpContext, HttpNextFunction } from "@/core";
import { TestContext } from "@/tests";
import axios from "axios";
import { Middleware } from "./Middleware";
import { MiddlewareFactory } from "./MiddlewareFactory";
import { MiddlewareFunction } from "./MiddlewareFunction";
import { MiddlewareResult } from "./MiddlewareResult";

const testSuiteName = "middleware/v2/UseMiddlewares";

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

  it("Can bootstrap MiddlewareFunctions", (done) => {
    const collectedData: number[] = [];

    const firstMiddleware: MiddlewareFunction = (_, next) => {
      collectedData.push(1);
      next();
    };

    const secondMiddleware: MiddlewareFunction = (_, next) => {
      collectedData.push(2);
      next();
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

    new AppBuilder({ port, logger })
      .useMiddlewares(firstMiddleware, secondMiddleware)
      .useControllers(TestController)
      .buildAsync()
      .then((server) => {
        context.server = server;
        axios.get(address);
      });
  });

  it("Can bootstrap Middleware instances", (done) => {
    const collectedData: number[] = [];

    class FirstMiddleware implements Middleware {
      delegate(_: HttpContext, next: HttpNextFunction): MiddlewareResult {
        collectedData.push(1);
        next();
      }
    }

    class SecondMiddleware implements Middleware {
      delegate(_: HttpContext, next: HttpNextFunction): MiddlewareResult {
        collectedData.push(2);
        next();
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

    new AppBuilder({ port, logger })
      .useMiddlewares(new FirstMiddleware(), new SecondMiddleware())
      .useControllers(TestController)
      .buildAsync()
      .then((server) => {
        context.server = server;
        axios.get(address);
      });
  });

  it("Can bootstrap Middleware constructors", (done) => {
    const collectedData: number[] = [];

    @injectable()
    class FirstMiddleware implements Middleware {
      delegate(_: HttpContext, next: HttpNextFunction): MiddlewareResult {
        collectedData.push(1);
        next();
      }
    }

    @injectable()
    class SecondMiddleware implements Middleware {
      delegate(_: HttpContext, next: HttpNextFunction): MiddlewareResult {
        collectedData.push(2);
        next();
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
      .addClass(FirstMiddleware)
      .addClass(SecondMiddleware)
      .buildContainerAsync()
      .then((container) => {
        new AppBuilder({ port, logger, container })
          .useMiddlewares(FirstMiddleware, SecondMiddleware)
          .useControllers(TestController)
          .buildAsync()
          .then((server) => {
            context.server = server;
            axios.get(address);
          });
      });
  });

  it("Can bootstrap MiddlewareFactories that return a MiddlewareFunction", (done) => {
    const collectedData: number[] = [];

    const firstMiddleware: MiddlewareFunction = (_: HttpContext, next) => {
      collectedData.push(1);
      next();
    };

    const secondMiddleware: MiddlewareFunction = (_: HttpContext, next) => {
      collectedData.push(2);
      next();
    };

    class FirstMiddlewareFactory implements MiddlewareFactory {
      create(): MiddlewareFunction | Middleware | ClassConstructor<Middleware> {
        return firstMiddleware;
      }
    }

    class SecondMiddlewareFactory implements MiddlewareFactory {
      create(): MiddlewareFunction | Middleware | ClassConstructor<Middleware> {
        return secondMiddleware;
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

    new AppBuilder({ port, logger })
      .useMiddlewares(new FirstMiddlewareFactory(), new SecondMiddlewareFactory())
      .useControllers(TestController)
      .buildAsync()
      .then((server) => {
        context.server = server;
        axios.get(address);
      });
  });

  it("Can bootstrap MiddlewareFactories that return a Middleware instance", (done) => {
    const collectedData: number[] = [];

    class FirstMiddleware implements Middleware {
      delegate(context: HttpContext, next: HttpNextFunction): MiddlewareResult {
        collectedData.push(1);
        next();
      }
    }

    class SecondMiddleware implements Middleware {
      delegate(context: HttpContext, next: HttpNextFunction): MiddlewareResult {
        collectedData.push(2);
        next();
      }
    }

    class FirstMiddlewareFactory implements MiddlewareFactory {
      create(): MiddlewareFunction | Middleware | ClassConstructor<Middleware> {
        return new FirstMiddleware();
      }
    }

    class SecondMiddlewareFactory implements MiddlewareFactory {
      create(): MiddlewareFunction | Middleware | ClassConstructor<Middleware> {
        return new SecondMiddleware();
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

    new AppBuilder({ port, logger })
      .useMiddlewares(new FirstMiddlewareFactory(), new SecondMiddlewareFactory())
      .useControllers(TestController)
      .buildAsync()
      .then((server) => {
        context.server = server;
        axios.get(address);
      });
  });

  it("Can bootstrap MiddlewareFactories that return a Middleware constructor", (done) => {
    const collectedData: number[] = [];

    @injectable()
    class FirstMiddleware implements Middleware {
      delegate(context: HttpContext, next: HttpNextFunction): MiddlewareResult {
        collectedData.push(1);
        next();
      }
    }

    @injectable()
    class SecondMiddleware implements Middleware {
      delegate(context: HttpContext, next: HttpNextFunction): MiddlewareResult {
        collectedData.push(2);
        next();
      }
    }

    class FirstMiddlewareFactory implements MiddlewareFactory {
      create(): MiddlewareFunction | Middleware | ClassConstructor<Middleware> {
        return FirstMiddleware;
      }
    }

    class SecondMiddlewareFactory implements MiddlewareFactory {
      create(): MiddlewareFunction | Middleware | ClassConstructor<Middleware> {
        return SecondMiddleware;
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
      .addClass(FirstMiddleware)
      .addClass(SecondMiddleware)
      .buildContainerAsync()
      .then((container) => {
        new AppBuilder({ port, logger, container })
          .useMiddlewares(new FirstMiddlewareFactory(), new SecondMiddlewareFactory())
          .useControllers(TestController)
          .buildAsync()
          .then((server) => {
            context.server = server;
            axios.get(address);
          });
      });
  });
});
