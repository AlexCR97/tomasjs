import { injectable } from "@/container";
import { Logger } from "./Logger";
import { LoggerFactory } from "./LoggerFactory";
import { LogLevel } from "./LogLevel";
import { TomasLogger } from "./TomasLogger";

@injectable()
export class TomasLoggerFactory implements LoggerFactory {
  private readonly defaultLevel: LogLevel = "debug";

  create(category: string, level?: LogLevel): Logger {
    return new TomasLogger(category, level ?? this.defaultLevel);
  }
}
