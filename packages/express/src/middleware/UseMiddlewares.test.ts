import "reflect-metadata";
import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { bootstrapLoggerFactory } from "@tomasjs/logging";
import { Server } from "http";
import fetch from "node-fetch";
import { MiddlewareFunction } from "./MiddlewareFunction";
import { UseMiddlewares } from "./UseMiddlewares";
import { UseControllers, controller, httpGet } from "../controllers";
import { ExpressAppBuilder } from "../builder";
import { Middleware } from "./Middleware";
import { Request, Response, NextFunction } from "express";
import { ClassConstructor, ServiceContainerBuilder, injectable } from "@tomasjs/core";
import { MiddlewareFactory } from "./MiddlewareFactory";

describe("middlewares-UseMiddlewares", () => {
  let server: Server | undefined;
  const port = 3009;
  const serverAddress = `http://localhost:${port}`;
  const logger = bootstrapLoggerFactory("error");

  beforeEach(async () => {
    await disposeAsync();
  });

  afterEach(async () => {
    await disposeAsync();
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
      .then((expressServer) => {
        server = expressServer;
        fetch(serverAddress);
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
      .then((expressServer) => {
        server = expressServer;
        fetch(serverAddress);
      });
  });

  it("Can bootstrap Middleware constructors", (done) => {
    const collectedData: number[] = [];

    //@ts-ignore TODO Fix decorators not working in test files
    @injectable()
    class FirstMiddleware implements Middleware {
      handle(req: Request, res: Response, next: NextFunction): void | Promise<void> {
        collectedData.push(1);
        next();
      }
    }

    //@ts-ignore TODO Fix decorators not working in test files
    @injectable()
    class SecondMiddleware implements Middleware {
      handle(req: Request, res: Response, next: NextFunction): void | Promise<void> {
        collectedData.push(2);
        next();
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
          .then((expressServer) => {
            server = expressServer;
            fetch(serverAddress);
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
      .then((expressServer) => {
        server = expressServer;
        fetch(serverAddress);
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
      .then((expressServer) => {
        server = expressServer;
        fetch(serverAddress);
      });
  });

  it("Can bootstrap MiddlewareFactories that return a Middleware constructor", (done) => {
    const collectedData: number[] = [];

    //@ts-ignore TODO Fix decorators not working in test files
    @injectable()
    class FirstMiddleware implements Middleware {
      handle(req: Request, res: Response, next: NextFunction): void | Promise<void> {
        collectedData.push(1);
        next();
      }
    }

    //@ts-ignore TODO Fix decorators not working in test files
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
          .then((expressServer) => {
            server = expressServer;
            fetch(serverAddress);
          });
      });
  });

  async function disposeAsync() {
    server?.close();
  }
});
