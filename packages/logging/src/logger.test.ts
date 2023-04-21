import "reflect-metadata";
import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { ContainerBuilder, globalContainer, injectable } from "@tomasjs/core";
import { LogLevel } from "./LogLevel";
import { Logger } from "./Logger";
import { LoggerFactory } from "./LoggerFactory";
import { LoggerFactoryResolver } from "./LoggerFactoryResolver";
import { LoggerFactorySetup } from "./LoggerFactorySetup";
import { LoggerFactoryToken } from "./LoggerFactoryToken";
import { TomasLogger } from "./TomasLogger";
import { TomasLoggerFactory } from "./TomasLoggerFactory";
import { TomasLoggerFactorySetup } from "./TomasLoggerFactorySetup";
import { bootstrapLoggerFactory } from "./bootstrapLoggerFactory";

describe("logger", () => {
  beforeEach(async () => {
    if (globalContainer.has(LoggerFactoryToken)) {
      globalContainer.remove(LoggerFactoryToken);
    }
  });

  afterEach(async () => {
    if (globalContainer.has(LoggerFactoryToken)) {
      globalContainer.remove(LoggerFactoryToken);
    }
  });

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
    await new ContainerBuilder().setup(new TomasLoggerFactorySetup()).buildAsync();

    const factory = new LoggerFactoryResolver().getLoggerFactory();
    const logger = factory.create("logger.test.ts");

    expect(logger).toBeInstanceOf(TomasLogger);

    logger.info('This is a log with "info" level!');
  });

  it(`The ${TomasLoggerFactory.name} can be resolved via the LoggerFactoryToken`, async () => {
    await new ContainerBuilder().setup(new TomasLoggerFactorySetup()).buildAsync();

    const loggerFactory = globalContainer.get(LoggerFactoryToken);

    expect(loggerFactory).toBeTruthy();
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

    await new ContainerBuilder().setup(new CustomLoggerFactorySetup()).buildAsync();

    const loggerFactory = globalContainer.get(LoggerFactoryToken);

    expect(loggerFactory).toBeInstanceOf(CustomLoggerFactory);
  });
});