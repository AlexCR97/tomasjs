import "reflect-metadata";
import { describe, expect, it } from "@jest/globals";
import { ServiceContainerBuilder, injectable } from "@tomasjs/core";
import { LogLevel } from "./LogLevel";
import { Logger } from "./Logger";
import { LoggerFactory } from "./LoggerFactory";
import { LoggerFactorySetup } from "./LoggerFactorySetup";
import { loggerFactoryToken } from "./loggerFactoryToken";
import { TomasLogger } from "./TomasLogger";
import { TomasLoggerFactory } from "./TomasLoggerFactory";
import { TomasLoggerFactorySetup } from "./TomasLoggerFactorySetup";
import { bootstrapLoggerFactory } from "./bootstrapLoggerFactory";

describe("logger", () => {
  it(`The ${bootstrapLoggerFactory.name} can be used to create logger`, () => {
    const logger = bootstrapLoggerFactory("debug");

    expect(logger).toBeTruthy();
    expect(logger.debug).toBeTruthy();
    expect(logger.verbose).toBeTruthy();
    expect(logger.info).toBeTruthy();
    expect(logger.warn).toBeTruthy();
    expect(logger.error).toBeTruthy();

    logger.debug('This is a log with "debug" level.');
    logger.verbose('This is a log with "verbose" level.');
    logger.info('This is a log with "info" level.');
    logger.warn('This is a log with "warn" level.');
    logger.error('This is a log with "error" level.');
  });

  it(`The ${TomasLoggerFactory.name} provides a ${TomasLogger.name}`, () => {
    const factory = new TomasLoggerFactory();
    const logger = factory.create("logger.test.ts");

    expect(logger).toBeInstanceOf(TomasLogger);

    logger.error('This is a log with "error" level!');
    logger.warn('This is a log with "warn" level!');
    logger.info('This is a log with "info" level!');
    logger.verbose('This is a log with "verbose" level!');
    logger.debug('This is a log with "debug" level!');
  });

  it(`The ${TomasLoggerFactorySetup.name} can be used to register the ${TomasLogger.name} as the default logger`, async () => {
    const services = await new ServiceContainerBuilder()
      .setup(new TomasLoggerFactorySetup())
      .buildServiceProviderAsync();

    const loggerFactory = services.get<LoggerFactory>(loggerFactoryToken);
    expect(loggerFactory).toBeInstanceOf(TomasLoggerFactory);

    const logger = loggerFactory.create("logger.test.ts");
    expect(logger).toBeInstanceOf(TomasLogger);

    logger.info('This is a log with "info" level!');
  });

  it(`The ${LoggerFactorySetup.name} can be used to register a custom Logger`, async () => {
    class CustomLogger implements Logger {
      constructor(private readonly category: string, private readonly level: LogLevel) {}

      error(message: string, data?: any): void {
        throw new Error("Method not implemented.");
      }
      warn(message: string, data?: any): void {
        throw new Error("Method not implemented.");
      }
      info(message: string, data?: any): void {
        console.log(`[${this.category}][${this.level}] ${message}`);
      }
      verbose(message: string, data?: any): void {
        throw new Error("Method not implemented.");
      }
      debug(message: string, data?: any): void {
        throw new Error("Method not implemented.");
      }
    }

    //@ts-ignore: Fix decorators not working in test files
    @injectable()
    class CustomLoggerFactory implements LoggerFactory {
      create(category: string, level?: LogLevel | undefined): Logger {
        return new CustomLogger(category, level ?? "error");
      }
    }

    class CustomLoggerFactorySetup extends LoggerFactorySetup<CustomLoggerFactory> {
      constructor() {
        super(CustomLoggerFactory);
      }
    }

    const services = await new ServiceContainerBuilder()
      .setup(new CustomLoggerFactorySetup())
      .buildServiceProviderAsync();

    const loggerFactory = services.get<LoggerFactory>(loggerFactoryToken);

    expect(loggerFactory).toBeInstanceOf(CustomLoggerFactory);
  });
});
