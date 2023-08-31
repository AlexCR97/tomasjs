import "reflect-metadata";
import { describe, expect, it } from "@jest/globals";
import { TomasLogger } from "./TomasLogger";
import { GlobalLoggingOptions, globalLoggingOptions } from "./GlobalLoggingOptions";
import { LogLevel } from "./LogLevel";
import { Logger } from "./Logger";
import { readJsonFile } from "@/files";

describe("logging-GlobalLoggingOptions", () => {
  const logLevels: LogLevel[] = ["debug", "verbose", "info", "warn", "error"];

  function doLogs(logger: Logger) {
    logger.debug("debug");
    logger.verbose("verbose");
    logger.info("info");
    logger.warn("warn");
    logger.error("error");
  }

  it("Can configure from an options object", () => {
    const options: GlobalLoggingOptions = {
      minimumLevel: {
        default: "warn",
        override: {
          SomeCategory: "debug",
        },
      },
    };

    globalLoggingOptions.from.options(options);

    expect(globalLoggingOptions.value()).toBe(options);
  });

  it("Can configure from a json file", () => {
    const loggingConfigPath = "logging.config.json";
    const jsonOptions: GlobalLoggingOptions = readJsonFile(loggingConfigPath);
    globalLoggingOptions.from.file(loggingConfigPath);

    const globalOptions = globalLoggingOptions.value();

    expect(globalOptions.minimumLevel).toBeTruthy();
    expect(globalOptions.minimumLevel!.default).toBe(jsonOptions.minimumLevel?.default);
    expect(globalOptions.minimumLevel!.override).toBeTruthy();
    expect(globalOptions.minimumLevel!.override!.Foo).toBe(jsonOptions.minimumLevel?.override?.Foo);
    expect(globalOptions.minimumLevel!.override!.Bar).toBe(jsonOptions.minimumLevel?.override?.Bar);
  });

  it("Can configure from a json file in a specific section", () => {
    const loggingConfigPath = "logging.config.json";
    const jsonOptions: GlobalLoggingOptions = readJsonFile(loggingConfigPath);
    globalLoggingOptions.from.file(loggingConfigPath);

    const globalOptions = globalLoggingOptions.value();

    expect(globalOptions.minimumLevel).toBeTruthy();
    expect(globalOptions.minimumLevel!.default).toBe(jsonOptions.minimumLevel?.default);
    expect(globalOptions.minimumLevel!.override).toBeTruthy();
    expect(globalOptions.minimumLevel!.override!.Foo).toBe(jsonOptions.minimumLevel?.override?.Foo);
    expect(globalOptions.minimumLevel!.override!.Bar).toBe(jsonOptions.minimumLevel?.override?.Bar);
  });

  it("Can configure a global default level", () => {
    globalLoggingOptions.clear();

    const logger = new TomasLogger("TestDefaultLevel", "debug");

    for (const level of logLevels) {
      console.log("Now using level:", level);
      globalLoggingOptions.minimumLevel.default(level);
      doLogs(logger);
    }

    globalLoggingOptions.clear();
  });

  it("Can configure global override levels", () => {
    globalLoggingOptions.clear();

    const fooLogger = new TomasLogger("Foo", "debug");
    const barLogger = new TomasLogger("Bar", "debug");

    globalLoggingOptions.minimumLevel.override("Foo", "info");
    globalLoggingOptions.minimumLevel.override("Bar", "error");

    doLogs(fooLogger);
    doLogs(barLogger);

    globalLoggingOptions.minimumLevel.override("Foo", "error");
    globalLoggingOptions.minimumLevel.override("Bar", "info");

    doLogs(fooLogger);
    doLogs(barLogger);

    globalLoggingOptions.clear();
  });
});
