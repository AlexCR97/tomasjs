import "express-async-errors";
import "reflect-metadata";
import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { Server } from "http";
import fetch from "node-fetch";
import { UseControllers, controller, httpGet } from "@/controllers";
import {
  NotImplementedError,
  ServiceContainerBuilder,
  TomasError,
  TomasLogger,
  injectable,
} from "@tomasjs/core";
import { ExpressAppBuilder } from "@/builder";
import { ErrorHandler, ErrorHandlerFunction, TomasErrorHandler, UseErrorHandler } from ".";
import { statusCodes } from "@/core";
import { TomasErrorHandlerFactory } from "./TomasErrorHandlerFactory";
import { Request, Response, NextFunction } from "express";
import { ErrorHandlerFactory } from "./ErrorHandlerFactory";

describe("errorHandlers-UseErrorHandler", () => {
  let server: Server | undefined;
  const port = 3017;
  const serverAddress = `http://localhost:${port}`;
  const logger = new TomasLogger("errorHandlers-UseErrorHandler", "error");

  beforeEach(async () => {
    await disposeAsync();
  });

  afterEach(async () => {
    await disposeAsync();
  });

  it("Can use TomasErrorHandler", async () => {
    @controller()
    class TestController {
      @httpGet()
      get() {
        throw new NotImplementedError(this.get.name);
      }
    }

    await new ExpressAppBuilder({ port, logger })
      .use(new UseControllers({ controllers: [TestController], logger }))
      .use(new UseErrorHandler({ errorHandler: new TomasErrorHandler() }))
      .buildAsync();

    const response = await fetch(`${serverAddress}`);
    expect(response.status).toBe(statusCodes.internalServerError);
  });

  it("Can use TomasErrorHandlerFactory", async () => {
    const port = 3018;

    @controller()
    class TestController {
      @httpGet()
      get() {
        throw new NotImplementedError(this.get.name);
      }
    }

    await new ExpressAppBuilder({ port, logger })
      .use(new UseControllers({ controllers: [TestController], logger }))
      .use(
        new UseErrorHandler({
          errorHandler: new TomasErrorHandlerFactory({
            logger,
            includeStackTrace: true,
          }),
        })
      )
      .buildAsync();

    const response = await fetch(`${serverAddress}`);
    expect(response.status).toBe(statusCodes.internalServerError);

    const responseJson = await response.json();
    console.log("responseJson", responseJson);
  });

  it("Can bootstrap ErrorHandlerFunction", (done) => {
    const port = 3019;
    const serverAddress = `http://localhost:${port}`;
    const logger = new TomasLogger("test", "error");

    const testErrorHandler: ErrorHandlerFunction = (err, req, res, next) => {
      done();
    };

    @controller()
    class TestController {
      @httpGet()
      get() {
        throw new TomasError("This is a test error");
      }
    }

    new ExpressAppBuilder({ port, logger })
      .use(new UseControllers({ controllers: [TestController], logger }))
      .use(new UseErrorHandler({ errorHandler: testErrorHandler }))
      .buildAsync()
      .then(() => {
        fetch(`${serverAddress}`);
      });
  });

  it("Can bootstrap ErrorHandler instance", (done) => {
    const port = 3020;
    const serverAddress = `http://localhost:${port}`;
    const logger = new TomasLogger("test", "error");

    class TestErrorHandler implements ErrorHandler {
      catch(error: any, req: Request, res: Response, next: NextFunction) {
        done();
      }
    }

    @controller()
    class TestController {
      @httpGet()
      get() {
        throw new TomasError("This is a test error");
      }
    }

    new ExpressAppBuilder({ port, logger })
      .use(new UseControllers({ controllers: [TestController], logger }))
      .use(new UseErrorHandler({ errorHandler: new TestErrorHandler() }))
      .buildAsync()
      .then(() => {
        fetch(`${serverAddress}`);
      });
  });

  it("Can bootstrap ErrorHandler class", (done) => {
    const port = 3021;
    const serverAddress = `http://localhost:${port}`;
    const logger = new TomasLogger("test", "error");

    @injectable()
    class TestErrorHandler implements ErrorHandler {
      catch(error: any, req: Request, res: Response, next: NextFunction) {
        done();
      }
    }

    @controller()
    class TestController {
      @httpGet()
      get() {
        throw new TomasError("This is a test error");
      }
    }

    new ServiceContainerBuilder()
      .addClass(TestErrorHandler)
      .buildContainerAsync()
      .then((container) => {
        new ExpressAppBuilder({ port, logger, container })
          .use(new UseControllers({ controllers: [TestController], logger }))
          .use(new UseErrorHandler({ errorHandler: TestErrorHandler }))
          .buildAsync()
          .then(() => {
            fetch(`${serverAddress}`);
          });
      });
  });

  it("Can bootstrap ErrorHandlerFactory that returns an ErrorHandlerFunction", (done) => {
    const port = 3023;
    const serverAddress = `http://localhost:${port}`;
    const logger = new TomasLogger("test", "error");

    const testErrorHandler: ErrorHandlerFunction = (err, req, res, next) => {
      done();
    };

    class TestErrorHandlerFactory implements ErrorHandlerFactory {
      create(): ErrorHandlerFunction {
        return testErrorHandler;
      }
    }

    @controller()
    class TestController {
      @httpGet()
      get() {
        throw new TomasError("This is a test error");
      }
    }

    new ExpressAppBuilder({ port, logger })
      .use(new UseControllers({ controllers: [TestController], logger }))
      .use(new UseErrorHandler({ errorHandler: new TestErrorHandlerFactory() }))
      .buildAsync()
      .then(() => {
        fetch(`${serverAddress}`);
      });
  });

  it("Can bootstrap ErrorHandlerFactory that returns an ErrorHandler instance", (done) => {
    const port = 3024;
    const serverAddress = `http://localhost:${port}`;
    const logger = new TomasLogger("test", "error");

    class TestErrorHandler implements ErrorHandler {
      catch(error: any, req: Request, res: Response, next: NextFunction) {
        done();
      }
    }

    class TestErrorHandlerFactory implements ErrorHandlerFactory {
      create(): ErrorHandler {
        return new TestErrorHandler();
      }
    }

    @controller()
    class TestController {
      @httpGet()
      get() {
        throw new TomasError("This is a test error");
      }
    }

    new ExpressAppBuilder({ port, logger })
      .use(new UseControllers({ controllers: [TestController], logger }))
      .use(new UseErrorHandler({ errorHandler: new TestErrorHandlerFactory() }))
      .buildAsync()
      .then(() => {
        fetch(`${serverAddress}`);
      });
  });

  it("Can bootstrap ErrorHandlerFactory that returns an ErrorHandler class", (done) => {
    const port = 3025;
    const serverAddress = `http://localhost:${port}`;
    const logger = new TomasLogger("test", "error");

    @injectable()
    class TestErrorHandler implements ErrorHandler {
      catch(error: any, req: Request, res: Response, next: NextFunction) {
        done();
      }
    }

    class TestErrorHandlerFactory implements ErrorHandlerFactory {
      create(): ErrorHandler {
        return new TestErrorHandler();
      }
    }

    @controller()
    class TestController {
      @httpGet()
      get() {
        throw new TomasError("This is a test error");
      }
    }

    new ServiceContainerBuilder()
      .addClass(TestErrorHandler)
      .buildContainerAsync()
      .then((container) => {
        new ExpressAppBuilder({ port, logger, container })
          .use(new UseControllers({ controllers: [TestController], logger }))
          .use(new UseErrorHandler({ errorHandler: new TestErrorHandlerFactory() }))
          .buildAsync()
          .then(() => {
            fetch(`${serverAddress}`);
          });
      });
  });

  async function disposeAsync() {
    server?.close();
  }
});
