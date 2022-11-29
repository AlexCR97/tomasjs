import { ILogger } from "./ILogger";
import { LoggerOptions } from "./LoggerOptions";

export const ILoggerProviderToken = "ILoggerProvider";

export interface ILoggerProvider {
  createLogger(category: string, options?: LoggerOptions): ILogger;
}
