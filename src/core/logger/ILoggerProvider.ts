import { ILogger } from "./ILogger";

export const ILoggerProviderToken = "ILoggerProvider";

export interface ILoggerProvider {
  createLogger(category: string): ILogger;
}
