import "reflect-metadata";
import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { MiddlewareFunction } from "./MiddlewareFunction";
import { UseMiddlewares } from "./UseMiddlewares";
import { UseControllers, controller, httpGet } from "@/controllers";
import { ExpressAppBuilder } from "@/builder";
import { Middleware } from "./Middleware";
import { Request, Response, NextFunction } from "express";
import { ClassConstructor, Logger, ServiceContainerBuilder, injectable } from "@tomasjs/core";
import { MiddlewareFactory } from "./MiddlewareFactory";
import { TestContext } from "@/tests";
import axios from "axios";

const testSuiteName = "middleware/UseMiddlewares";

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

    const firstMiddleware: MiddlewareFunction = (req, res, next) => {
      collectedData.push(1);
      next();
    };

    const secondMiddleware: MiddlewareFunction = (req, res, next) => {
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

    new ExpressAppBuilder({ port, logger })
      .use(
        new UseMiddlewares({
          middlewares: [firstMiddleware, secondMiddleware],
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

  it("Can bootstrap Middleware instances", (done) => {
    const collectedData: number[] = [];

    class FirstMiddleware implements Middleware {
      handle(req: Request, res: Response, next: NextFunction): void | Promise<void> {
        collectedData.push(1);
        next();
      }
    }

    class SecondMiddleware implements Middleware {
      handle(req: Request, res: Response, next: NextFunction): void | Promise<void> {
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

    new ExpressAppBuilder({ port, logger })
      .use(
        new UseMiddlewares({
          middlewares: [new FirstMiddleware(), new SecondMiddleware()],
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

  it("Can bootstrap Middleware constructors", (done) => {
    const collectedData: number[] = [];

    @injectable()
    class FirstMiddleware implements Middleware {
      handle(req: Request, res: Response, next: NextFunction): void | Promise<void> {
        collectedData.push(1);
        next();
      }
    }

    @injectable()
    class SecondMiddleware implements Middleware {
      handle(req: Request, res: Response, next: NextFunction): void | Promise<void> {
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
        new ExpressAppBuilder({ port, logger, container })
          .use(
            new UseMiddlewares({
              middlewares: [FirstMiddleware, SecondMiddleware],
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

  it("Can bootstrap MiddlewareFactories that return a MiddlewareFunction", (done) => {
    const collectedData: number[] = [];

    const firstMiddleware: MiddlewareFunction = (req, res, next) => {
      collectedData.push(1);
      next();
    };

    const secondMiddleware: MiddlewareFunction = (req, res, next) => {
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

    new ExpressAppBuilder({ port, logger })
      .use(
        new UseMiddlewares({
          middlewares: [new FirstMiddlewareFactory(), new SecondMiddlewareFactory()],
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

  it("Can bootstrap MiddlewareFactories that return a Middleware instance", (done) => {
    const collectedData: number[] = [];

    class FirstMiddleware implements Middleware {
      handle(req: Request, res: Response, next: NextFunction): void | Promise<void> {
        collectedData.push(1);
        next();
      }
    }

    class SecondMiddleware implements Middleware {
      handle(req: Request, res: Response, next: NextFunction): void | Promise<void> {
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

    new ExpressAppBuilder({ port, logger })
      .use(
        new UseMiddlewares({
          middlewares: [new FirstMiddlewareFactory(), new SecondMiddlewareFactory()],
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

  it("Can bootstrap MiddlewareFactories that return a Middleware constructor", (done) => {
    const collectedData: number[] = [];

    @injectable()
    class FirstMiddleware implements Middleware {
      handle(req: Request, res: Response, next: NextFunction): void | Promise<void> {
        collectedData.push(1);
        next();
      }
    }

    @injectable()
    class SecondMiddleware implements Middleware {
      handle(req: Request, res: Response, next: NextFunction): void | Promise<void> {
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
        new ExpressAppBuilder({ port, logger, container })
          .use(
            new UseMiddlewares({
              middlewares: [new FirstMiddlewareFactory(), new SecondMiddlewareFactory()],
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
});
