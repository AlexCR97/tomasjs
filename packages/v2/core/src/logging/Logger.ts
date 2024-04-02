import {
  Logger as WinstonLogger,
  createLogger as createWinstonLogger,
  format as winstonFormat,
  transports as winstonTransport,
} from "winston";
import { SPLAT } from "triple-beam";
import { pipe } from "@/pipe";
import { Configuration } from "@/configuration/Configuration";

export interface ILogger {
  log(level: LogLevel, message: any, ...params: any[]): void;
  debug(message: any, ...params: any[]): void;
  verbose(message: any, ...params: any[]): void;
  info(message: any, ...params: any[]): void;
  warn(message: any, ...params: any[]): void;
  error(message: any, ...params: any[]): void;
}

export type LogLevel = "debug" | "verbose" | "info" | "warn" | "error";

interface LoggerContext {
  message: string;
  level: string;
  category: string;
  timestamp: string;
  [SPLAT]: any[];
}

const customMessageFormat = winstonFormat.printf((context: any) => {
  // IMPORTANT: Apply type in next line instead of in param to avoid this error:
  // Argument of type '(context: LoggerContext) => string' is not assignable to parameter of type '(info: TransformableInfo) => string'
  const { timestamp, category, level, message } = context as LoggerContext;
  const messageTokens: string[] = [timestamp, `[${category}]`, `${level}:`, message];
  const splat = context[SPLAT];

  if (splat && splat.length > 0) {
    const splatToken = pipe(splat)
      .pipe((splat) => (splat.length === 1 ? splat[0] : splat))
      .pipe((splat) => JSON.stringify(splat))
      .pipe((json) => `\x1B[35m${json}\x1B[39m`)
      .get();

    messageTokens.push(splatToken);
  }

  return messageTokens.join(" ");
});

const logLevelScores = new Map<LogLevel, number>([
  ["error", 0],
  ["warn", 1],
  ["info", 2],
  ["verbose", 3],
  ["debug", 4],
]);

export class Logger implements ILogger {
  private readonly logger: WinstonLogger;

  private readonly format = winstonFormat.combine(
    winstonFormat.colorize(), // Gives color to every level
    winstonFormat.timestamp(), // Adds timestamp to metadata
    winstonFormat.padLevels(), // Adds equal padding after level to each message
    winstonFormat.simple(), // Prints in a single line
    customMessageFormat
  );

  private readonly defaultTransport = new winstonTransport.Console();

  constructor(
    private readonly category: string,
    private readonly level: LogLevel,
    private readonly configuration: Configuration
  ) {
    this.logger = createWinstonLogger({
      defaultMeta: { category },
      level,
      levels: Object.fromEntries(logLevelScores),
      format: this.format,
      transports: [this.defaultTransport],
    });
  }

  log(method: LogLevel, message: any, ...params: any[]): void {
    this.tryOverrideWithDefaultLevel();
    this.tryOverrideWithOverrideLevel();
    this.logger[method](message, ...params);
    this.resetOriginalLevel();
  }

  debug(message: any, ...params: any[]): void {
    this.log("debug", message, ...params);
  }

  verbose(message: any, ...params: any[]): void {
    this.log("verbose", message, ...params);
  }

  info(message: any, ...params: any[]) {
    this.log("info", message, ...params);
  }

  warn(message: any, ...params: any[]): void {
    this.log("warn", message, ...params);
  }

  error(message: any, ...params: any[]): void {
    this.log("error", message, ...params);
  }

  private tryOverrideWithDefaultLevel() {
    this.logger.level =
      this.configuration.section("logging.minimumLevel.default")?.value<LogLevel>("string") ??
      this.level;
  }

  private tryOverrideWithOverrideLevel() {
    const override = this.configuration.section("logging.minimumLevel.override");

    if (override === null) {
      return;
    }

    this.logger.level = override.section(this.category)?.value<LogLevel>("string") ?? this.level;
  }

  private resetOriginalLevel() {
    this.logger.level = this.level;
  }
}
