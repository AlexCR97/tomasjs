import {
  Logger as WinstonLogger,
  createLogger as createWinstonLogger,
  format as winstonFormat,
  transports as winstonTransport,
} from "winston";
import { Logger } from "./Logger";
import { LogLevel } from "./LogLevel";
import { SPLAT } from "triple-beam";
import { Pipe } from "@/pipes";

interface LoggerContext {
  message: string;
  level: string;
  category: string;
  timestamp: string;
  [SPLAT]: any[];
}

const customMessageFormat = winstonFormat.printf((context: LoggerContext) => {
  // console.log("context", context);
  const { timestamp, category, level, message } = context;
  const messageTokens: string[] = [timestamp, `[${category}]`, `${level}:`, message];
  const splat = context[SPLAT];

  if (splat && splat.length > 0) {
    const splatToken = new Pipe(splat)
      .apply((splat) => (splat.length === 1 ? splat[0] : splat))
      .apply((splat) => JSON.stringify(splat))
      .apply((json) => `\x1B[35m${json}\x1B[39m`)
      .get();

    messageTokens.push(splatToken);
  }

  return messageTokens.join(" ");
});

export class TomasLogger implements Logger {
  private readonly logger: WinstonLogger;

  private readonly format = winstonFormat.combine(
    winstonFormat.colorize(), // Gives color to every level
    winstonFormat.timestamp(), // Adds timestamp to metadata
    winstonFormat.padLevels(), // Adds equal padding after level to each message
    winstonFormat.simple(), // Prints in a single line
    customMessageFormat
  );

  private readonly defaultTransport = new winstonTransport.Console();

  constructor(category: string, level: LogLevel) {
    this.logger = createWinstonLogger({
      defaultMeta: { category },
      level,
      levels: Object.fromEntries(
        new Map<keyof Logger, number>([
          ["error", 0],
          ["warn", 1],
          ["info", 2],
          ["verbose", 3],
          ["debug", 4],
        ])
      ),
      format: this.format,
      transports: [this.defaultTransport],
    });
  }

  debug(message: any, ...params: any[]): void {
    this.logger.debug(message, ...params);
  }

  verbose(message: any, ...params: any[]): void {
    this.logger.verbose(message, ...params);
  }

  info(message: any, ...params: any[]) {
    this.logger.info(message, ...params);
  }

  warn(message: any, ...params: any[]): void {
    this.logger.warn(message, ...params);
  }

  error(message: any, ...params: any[]): void {
    this.logger.error(message, ...params);
  }
}
