import { ILogger, LogLevel, Logger, LoggerOptions } from "./Logger";
import { Configuration, IConfiguration } from "@/configuration";

export interface ILoggerBuilder {
  withCategory(category: string): this;
  withConfiguration(configuration: IConfiguration): this;
  withLevel(level: LogLevel): this;
  showCategory(show: boolean): this;
  showLevel(show: boolean): this;
  showTimestamp(show: boolean): this;
  build(): ILogger;
}

export class LoggerBuilder implements ILoggerBuilder {
  private constructor(
    private _category: string,
    private _configuration: IConfiguration,
    private _level: LogLevel,
    private _showCategory: boolean,
    private _showLevel: boolean,
    private _showTimestamp: boolean
  ) {}

  withCategory(category: string): this {
    this._category = category;
    return this;
  }

  withConfiguration(configuration: IConfiguration): this {
    this._configuration = configuration;
    return this;
  }

  withLevel(level: LogLevel): this {
    this._level = level;
    return this;
  }

  showCategory(show: boolean): this {
    this._showCategory = show;
    return this;
  }

  showLevel(show: boolean): this {
    this._showLevel = show;
    return this;
  }

  showTimestamp(show: boolean): this {
    this._showTimestamp = show;
    return this;
  }

  build(): ILogger {
    return new Logger({
      category: this._category,
      configuration: this._configuration,
      level: this._level,
      showCategory: this._showCategory,
      showLevel: this._showLevel,
      showTimestamp: this._showTimestamp,
    });
  }

  static readonly defaultOptions: LoggerOptions = {
    category: "default",
    configuration: Configuration.empty(),
    level: "debug",
    showCategory: true,
    showLevel: true,
    showTimestamp: true,
  };

  static default(): ILoggerBuilder {
    return this.fromOptions(this.defaultOptions);
  }

  static fromOptions(options: Partial<LoggerOptions>): ILoggerBuilder {
    return new LoggerBuilder(
      options.category ?? this.defaultOptions.category,
      options.configuration ?? this.defaultOptions.configuration,
      options.level ?? this.defaultOptions.level,
      options.showCategory ?? this.defaultOptions.showCategory,
      options.showLevel ?? this.defaultOptions.showLevel,
      options.showTimestamp ?? this.defaultOptions.showTimestamp
    );
  }
}
