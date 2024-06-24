import { inject } from "@/dependency-injection";
import { ILogger, LogLevel } from "./Logger";
import { configurationToken } from "@/configuration";
import { Configuration } from "@/configuration";
import { LoggerBuilder } from "./LoggerBuilder";

export interface ILoggerFactory {
  createLogger(category: string, level: LogLevel): ILogger;
}

// TODO Deprecate LoggerFactory
export class LoggerFactory implements ILoggerFactory {
  constructor(@inject(configurationToken) private readonly configuration: Configuration) {}

  createLogger(category: string, level: LogLevel): ILogger {
    return LoggerBuilder.default()
      .withCategory(category)
      .withLevel(level)
      .withConfiguration(this.configuration)
      .build();
  }
}
