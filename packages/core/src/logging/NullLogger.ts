import { LogData } from "./LogData";
import { ILogger } from "./Logger";
import { LogLevel } from "./LogLevel";

export class NullLogger implements ILogger {
  log(level: LogLevel, message: string, data?: LogData): void {}
  verbose(message: string, data?: LogData): void {}
  debug(message: string, data?: LogData): void {}
  info(message: string, data?: LogData): void {}
  warn(message: string, data?: LogData): void {}
  error(message: string, data?: LogData): void {}
  fatal(message: string, data?: LogData): void {}
}
