import { IConfiguration } from "@/configuration";
import { pipe } from "@/system";
import { Log } from "./Log";
import { LogData } from "./LogData";
import { compareLogLevel, LogLevel } from "./LogLevel";

export interface ILogger {
  log(level: LogLevel, message: string, data?: LogData): void;
  verbose(message: string, data?: LogData): void;
  debug(message: string, data?: LogData): void;
  info(message: string, data?: LogData): void;
  warn(message: string, data?: LogData): void;
  error(message: string, data?: LogData): void;
  fatal(message: string, data?: LogData): void;
}

export type LoggerOptions = {
  category: string;
  configuration: IConfiguration;
  format: string;
  level: LogLevel;
};

export class Logger implements ILogger {
  constructor(readonly options: LoggerOptions) {}

  log(level: LogLevel, message: string, data?: LogData): void {
    const computedLevel = this.computeLogLevel();

    const showLog = compareLogLevel(level, computedLevel) >= 0;

    if (showLog) {
      const log = Log.create({
        category: this.options.category,
        timestamp: new Date(),
        level: level,
        template: message,
        templateData: data ?? {},
        format: this.options.format,
      });

      const renderedMessage = log.message();

      process.stdout.write(`${renderedMessage}\n`);
    }
  }

  private computeLogLevel(): LogLevel {
    return pipe(this.options.level)
      .pipe((currentLevel) => {
        const defaultLevel = this.options.configuration
          .section("logging.minimumLevel.default")
          ?.value<LogLevel>("string");

        return defaultLevel ?? currentLevel;
      })
      .pipe((currentLevel) => {
        const overrideLevel = this.options.configuration
          .section("logging.minimumLevel.override")
          ?.section(this.options.category)
          ?.value<LogLevel>("string");

        return overrideLevel ?? currentLevel;
      })
      .get();
  }

  verbose(message: string, data?: LogData): void {
    this.log("verbose", message, data);
  }

  debug(message: string, data?: LogData): void {
    this.log("debug", message, data);
  }

  info(message: string, data?: LogData) {
    this.log("info", message, data);
  }

  warn(message: string, data?: LogData): void {
    this.log("warn", message, data);
  }

  error(message: string, data?: LogData): void {
    this.log("error", message, data);
  }

  fatal(message: string, data?: LogData): void {
    this.log("fatal", message, data);
  }
}
