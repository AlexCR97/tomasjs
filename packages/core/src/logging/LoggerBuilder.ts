import { Configuration, IConfiguration } from "@/configuration";
import { Log } from "./Log";
import { LogLevel } from "./LogLevel";
import { ILogger, Logger, LoggerOptions } from "./Logger";

export interface ILoggerBuilder {
  withCategory(category: string): this;
  withConfiguration(configuration: IConfiguration): this;
  withFormat(format: string): this;
  withLevel(level: LogLevel): this;
  build(): ILogger;
}

export class LoggerBuilder implements ILoggerBuilder {
  private constructor(
    private _category: string,
    private _configuration: IConfiguration,
    private _format: string,
    private _level: LogLevel
  ) {}

  withCategory(category: string): this {
    this._category = category;
    return this;
  }

  withConfiguration(configuration: IConfiguration): this {
    this._configuration = configuration;
    return this;
  }

  withFormat(format: string): this {
    this._format = format;
    return this;
  }

  withLevel(level: LogLevel): this {
    this._level = level;
    return this;
  }

  build(): ILogger {
    return new Logger({
      category: this._category,
      configuration: this._configuration,
      format: this._format,
      level: this._level,
    });
  }

  static readonly defaultOptions: LoggerOptions = {
    category: "default",
    configuration: Configuration.empty(),
    format: Log.DEFAULT_FORMAT,
    level: "debug",
  };

  static default(): ILoggerBuilder {
    return this.fromOptions(this.defaultOptions);
  }

  static fromOptions(options: Partial<LoggerOptions>): ILoggerBuilder {
    return new LoggerBuilder(
      options.category ?? this.defaultOptions.category,
      options.configuration ?? this.defaultOptions.configuration,
      options.format ?? this.defaultOptions.format,
      options.level ?? this.defaultOptions.level
    );
  }
}
