// TODO Move this file to package @tomasjs/logging

// import "reflect-metadata";
import { describe, it } from "@jest/globals";
// import { AppBuilder, ContainerBuilder } from "../../src/builder";
// import {
//   Logger,
//   LoggerFactory,
//   LoggerFactoryResolver,
//   LoggerFactorySetup,
//   LoggerFactoryToken,
//   LogLevel,
//   TomasLogger,
//   TomasLoggerFactory,
//   TomasLoggerFactorySetup,
// } from "../../src/logger";
// import { tryCloseServerAsync } from "../test-utils/server";
// import { endpoint, Endpoint } from "../../src/endpoints";
// import { HttpContext, StatusCodes } from "../../src/core";
// import { inject, injectable, internalContainer } from "../../src/container";
// import { OkResponse } from "../../src/responses/status-codes";
// import fetch from "node-fetch";

describe("logger", () => {
  // const port = 3041;
  // const serverAddress = `http://localhost:${port}`;
  // let server: any; // TODO Set http.Server type

  // beforeEach(async () => {
  //   await tryCloseServerAsync(server);
  // });

  // afterEach(async () => {
  //   await tryCloseServerAsync(server);

  //   if (internalContainer.has(LoggerFactoryToken)) {
  //     internalContainer.remove(LoggerFactoryToken);
  //   }
  // });

  // TODO Remove this test when this test file is moved into package @tomasjs/logging
  it("should work", () => {
    console.log("logger should work.");
  });

  // it(`The ${TomasLoggerFactory.name} provides a ${TomasLogger.name}`, () => {
  //   const factory = new TomasLoggerFactory();
  //   const logger = factory.create("logger.test.ts");

  //   expect(logger).toBeInstanceOf(TomasLogger);

  //   logger.error('This is a log with "error" level!');
  //   logger.warn('This is a log with "warn" level!');
  //   logger.info('This is a log with "info" level!');
  //   logger.verbose('This is a log with "verbose" level!');
  //   logger.debug('This is a log with "debug" level!');
  // });

  // it(`The ${TomasLoggerFactorySetup.name} can be used to register the ${TomasLogger.name} as the default logger`, async () => {
  //   await new ContainerBuilder().setup(new TomasLoggerFactorySetup()).buildAsync();

  //   const factory = LoggerFactoryResolver.get();
  //   const logger = factory.create("logger.test.ts");

  //   expect(logger).toBeInstanceOf(TomasLogger);

  //   logger.info('This is a log with "info" level!');
  // });

  // it(`The ${TomasLoggerFactory.name} can be injected via the LoggerFactoryToken`, async () => {
  //   @endpoint()
  //   class TestEndpoint implements Endpoint {
  //     private readonly logger: Logger;

  //     constructor(@inject(LoggerFactoryToken) loggerFactory: LoggerFactory) {
  //       this.logger = loggerFactory.create(TestEndpoint.name);
  //     }

  //     handle(context: HttpContext) {
  //       this.logger.info(`Log from ${TestEndpoint.name}`);
  //       return new OkResponse();
  //     }
  //   }

  //   await new ContainerBuilder().setup(new TomasLoggerFactorySetup()).buildAsync();

  //   server = await new AppBuilder().useEndpoint(TestEndpoint).buildAsync(port);

  //   const response = await fetch(serverAddress);

  //   expect(response.status).toBe(StatusCodes.ok);
  // });

  // it(`The ${LoggerFactorySetup.name} can be used to register a custom Logger`, async () => {
  //   class CustomLogger implements Logger {
  //     constructor(private readonly category: string, private readonly level: LogLevel) {}

  //     error(message: string, data?: any): void {
  //       throw new Error("Method not implemented.");
  //     }
  //     warn(message: string, data?: any): void {
  //       throw new Error("Method not implemented.");
  //     }
  //     info(message: string, data?: any): void {
  //       console.log(`[${this.category}][${this.level}] ${message}`);
  //     }
  //     verbose(message: string, data?: any): void {
  //       throw new Error("Method not implemented.");
  //     }
  //     debug(message: string, data?: any): void {
  //       throw new Error("Method not implemented.");
  //     }
  //   }

  //   @injectable()
  //   class CustomLoggerFactory implements LoggerFactory {
  //     create(category: string, level?: LogLevel | undefined): Logger {
  //       return new CustomLogger(category, level ?? "error");
  //     }
  //   }

  //   class CustomLoggerFactorySetup extends LoggerFactorySetup<CustomLoggerFactory> {
  //     constructor() {
  //       super(CustomLoggerFactory);
  //     }
  //   }

  //   @endpoint()
  //   class TestEndpoint implements Endpoint {
  //     private readonly logger: Logger;

  //     constructor(@inject(LoggerFactoryToken) loggerFactory: LoggerFactory) {
  //       this.logger = loggerFactory.create(TestEndpoint.name);
  //     }

  //     handle(context: HttpContext) {
  //       this.logger.info("Log with custom logger!");
  //       return new OkResponse();
  //     }
  //   }

  //   await new ContainerBuilder().setup(new CustomLoggerFactorySetup()).buildAsync();

  //   server = await new AppBuilder().useEndpoint(TestEndpoint).buildAsync(port);

  //   const response = await fetch(serverAddress);

  //   expect(response.status).toBe(StatusCodes.ok);
  // });
});
