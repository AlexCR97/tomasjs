import { injectable } from "tsyringe";
import winston from "winston";
import { ILogger } from "@/core/logger/ILogger";
import { ILoggerProvider } from "@/core/logger/ILoggerProvider";
import { WinstonLogger } from "./WinstonLogger";
import { LoggerOptions } from "@/core/logger";

const DefaultLevel = "silly";

const DefaultFormat: winston.Logform.Format = winston.format.combine(
  winston.format.colorize(), // Gives color to every level
  winston.format.json(), // Outputs metadata as json
  winston.format.timestamp(), // Adds timestamp to metadata
  winston.format.padLevels() // Adds equal padding to each message
);

@injectable()
export class WinstonLoggerProvider implements ILoggerProvider {
  createLogger(category: string, options?: LoggerOptions): ILogger {
    const logger = winston.createLogger({
      level: options?.level ?? DefaultLevel,
      format: DefaultFormat,
      defaultMeta: { _category: category },
      transports: [
        new winston.transports.Console({
          format: winston.format.simple(),
        }),
      ],
    });
    return new WinstonLogger(logger);
  }
}
