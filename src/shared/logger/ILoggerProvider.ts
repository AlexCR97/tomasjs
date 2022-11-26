import { ILogger } from "./ILogger";

export interface ILoggerProvider {
  createLogger(category: string): ILogger;
}
