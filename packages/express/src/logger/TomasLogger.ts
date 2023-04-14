import {
  Logger as WinstonLogger,
  createLogger,
  format as WinstonFormat,
  transports as WinstonTransport,
} from "winston";
import { Logger } from "./Logger";
import { LogLevel } from "./LogLevel";

export class TomasLogger implements Logger {
  private readonly logger: WinstonLogger;
  private readonly defaultFormat = WinstonFormat.combine(
    WinstonFormat.colorize(), // Gives color to every level
    WinstonFormat.timestamp(), // Adds timestamp to metadata
    WinstonFormat.padLevels(), // Adds equal padding after level to each message
    WinstonFormat.simple() // Prints in a single line
  );
  private readonly defaultTransport = new WinstonTransport.Console();

  constructor(category: string, level: LogLevel) {
    this.logger = createLogger({
      defaultMeta: { category },
      level,
      levels: Object.fromEntries(TomasLoggerLevels),
      format: this.defaultFormat,
      transports: [this.defaultTransport],
    });
  }

  error(message: string, data?: any): void {
    this.logger.error(message, data);
  }

  warn(message: string, data?: any): void {
    this.logger.warn(message, data);
  }

  info(message: string, data?: any) {
    this.logger.info(message, data);
  }

  verbose(message: string, data?: any): void {
    this.logger.verbose(message, data);
  }

  debug(message: string, data?: any): void {
    this.logger.debug(message, data);
  }
}

const TomasLoggerLevels = new Map<keyof Logger, number>([
  ["error", 0],
  ["warn", 1],
  ["info", 2],
  ["verbose", 3],
  ["debug", 4],
]);
