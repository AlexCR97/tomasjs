import "express-async-errors";
import "reflect-metadata";
import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { UseControllers, controller, httpGet } from "@/controllers";
import { Logger, ServiceContainerBuilder, TomasError, injectable } from "@tomasjs/core";
import { AppBuilder } from "@/builder";
import { HttpContext, HttpNextFunction, statusCodes } from "@/core";
import { TomasErrorHandlerFactory } from "./TomasErrorHandlerFactory";
import { ErrorHandlerFactory } from "./ErrorHandlerFactory";
import { TestContext } from "@/tests";
import fetch from "node-fetch"; // Use node-fetch instead of axios because of error "TypeError: Converting circular structure to JSON"
import { UseErrorHandler } from "./UseErrorHandler";
import { TomasErrorHandler } from "./TomasErrorHandler";
import { ErrorHandlerFunction } from "./ErrorHandlerFunction";
import { ErrorHandler } from "./ErrorHandler";
import { InternalServerErrorResponse } from "@/responses";

const testSuiteName = "error-handler/UseErrorHandler";

describe(testSuiteName, () => {
  let context: TestContext;
  let port: number;
  let address: string;
  let logger: Logger;

  beforeEach(async () => {
    context = await TestContext.new(testSuiteName, "error");
    port = context.port;
    address = context.address;
    logger = context.logger;
  });

  afterEach(async () => {
    await context.dispose();
  });

  it("Can use TomasErrorHandler", async () => {
    @controller()
    class TestController {
      @httpGet()
      get() {
        throw new TomasError("This is a test error");
      }
    }

    context.server = await new AppBuilder({ port, logger })
      .use(new UseControllers({ controllers: [TestController], logger }))
      .use(
        new UseErrorHandler({
          errorHandler: new TomasErrorHandler({}),
        })
      )
      .buildAsync();

    const response = await fetch(`${address}`);
    expect(response.status).toBe(statusCodes.internalServerError);
  });

  it("Can use TomasErrorHandlerFactory", async () => {
    @controller()
    class TestController {
      @httpGet()
      get() {
        throw new TomasError("This is a test error");
      }
    }

    context.server = await new AppBuilder({ port, logger })
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

    const response = await fetch(`${address}`);
    expect(response.status).toBe(statusCodes.internalServerError);
  });

  it("Can bootstrap ErrorHandlerFunction", (done) => {
    const testErrorHandler: ErrorHandlerFunction = (err, { response }, next) => {
      response.send(new InternalServerErrorResponse());
      done();
    };

    @controller()
    class TestController {
      @httpGet()
      get() {
        throw new TomasError("This is a test error");
      }
    }

    new AppBuilder({ port, logger })
      .use(new UseControllers({ controllers: [TestController], logger }))
      .use(new UseErrorHandler({ errorHandler: testErrorHandler }))
      .buildAsync()
      .then(async (server) => {
        context.server = server;
        await fetch(`${address}`);
      });
  });

  it("Can bootstrap ErrorHandler instance", (done) => {
    class TestErrorHandler implements ErrorHandler {
      catch(error: any, { response }: HttpContext, next: HttpNextFunction) {
        response.send(new InternalServerErrorResponse());
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

    new AppBuilder({ port, logger })
      .use(new UseControllers({ controllers: [TestController], logger }))
      .use(new UseErrorHandler({ errorHandler: new TestErrorHandler() }))
      .buildAsync()
      .then(async (server) => {
        context.server = server;
        await fetch(`${address}`);
      });
  });

  it("Can bootstrap ErrorHandler class", (done) => {
    @injectable()
    class TestErrorHandler implements ErrorHandler {
      catch(error: any, { response }: HttpContext, next: HttpNextFunction) {
        response.send(new InternalServerErrorResponse());
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
        new AppBuilder({ port, logger, container })
          .use(new UseControllers({ controllers: [TestController], logger }))
          .use(new UseErrorHandler({ errorHandler: TestErrorHandler }))
          .buildAsync()
          .then(async (server) => {
            context.server = server;
            await fetch(`${address}`);
          });
      });
  });

  it("Can bootstrap ErrorHandlerFactory that returns an ErrorHandlerFunction", (done) => {
    const testErrorHandler: ErrorHandlerFunction = (err, { response }, next) => {
      response.send(new InternalServerErrorResponse());
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

    new AppBuilder({ port, logger })
      .use(new UseControllers({ controllers: [TestController], logger }))
      .use(new UseErrorHandler({ errorHandler: new TestErrorHandlerFactory() }))
      .buildAsync()
      .then(async (server) => {
        context.server = server;
        await fetch(`${address}`);
      });
  });

  it("Can bootstrap ErrorHandlerFactory that returns an ErrorHandler instance", (done) => {
    class TestErrorHandler implements ErrorHandler {
      catch(error: any, { response }: HttpContext, next: HttpNextFunction) {
        response.send(new InternalServerErrorResponse());
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

    new AppBuilder({ port, logger })
      .use(new UseControllers({ controllers: [TestController], logger }))
      .use(new UseErrorHandler({ errorHandler: new TestErrorHandlerFactory() }))
      .buildAsync()
      .then(async (server) => {
        context.server = server;
        await fetch(`${address}`);
      });
  });

  it("Can bootstrap ErrorHandlerFactory that returns an ErrorHandler class", (done) => {
    @injectable()
    class TestErrorHandler implements ErrorHandler {
      catch(error: any, { response }: HttpContext, next: HttpNextFunction) {
        response.send(new InternalServerErrorResponse());
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
        new AppBuilder({ port, logger, container })
          .use(new UseControllers({ controllers: [TestController], logger }))
          .use(new UseErrorHandler({ errorHandler: new TestErrorHandlerFactory() }))
          .buildAsync()
          .then(async (server) => {
            context.server = server;
            await fetch(`${address}`);
          });
      });
  });
});
