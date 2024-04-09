import { inject } from "@/dependency-injection";
import { ILogger, LogLevel, Logger } from "./Logger";
import { configurationToken } from "@/configuration";
import { Configuration } from "@/configuration";

export interface ILoggerFactory {
  createLogger(category: string, level: LogLevel): ILogger;
}

export class LoggerFactory implements ILoggerFactory {
  constructor(@inject(configurationToken) private readonly configuration: Configuration) {}

  createLogger(category: string, level: LogLevel): ILogger {
    return new Logger(category, level, this.configuration);
  }
}
