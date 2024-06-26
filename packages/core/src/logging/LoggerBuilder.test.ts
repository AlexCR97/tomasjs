import "reflect-metadata";
import { LoggerBuilder } from "./LoggerBuilder";
import { Logger, LoggerOptions } from "./Logger";
import { Configuration } from "@/configuration";

describe("LoggerBuilder", () => {
  it("can build a default logger", async () => {
    const logger = LoggerBuilder.default().build();
    expect(logger).toBeInstanceOf(Logger);

    const typedLogger = logger as Logger;
    expect(typedLogger.options).toMatchObject(LoggerBuilder.defaultOptions);
  });

  it("can build a custom logger", async () => {
    const customOptions: Partial<LoggerOptions> = {
      category: "foo",
      configuration: Configuration.empty(),
      level: "info",
      showCategory: false,
      showLevel: true,
      showTimestamp: false,
    };

    const logger = LoggerBuilder.fromOptions(customOptions).build();
    expect(logger).toBeInstanceOf(Logger);

    const typedLogger = logger as Logger;
    expect(typedLogger.options).toMatchObject(customOptions);
  });
});
