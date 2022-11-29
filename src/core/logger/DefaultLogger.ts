import winston from "winston";
import { ILogger } from "./ILogger";

const DefaultLevel = "silly";

const DefaultFormat: winston.Logform.Format = winston.format.combine(
  winston.format.colorize(), // Gives color to every level
  winston.format.json(), // Outputs metadata as json
  winston.format.timestamp(), // Adds timestamp to metadata
  winston.format.padLevels() // Adds equal padding to each message
);

export class DefaultLogger implements ILogger {
  private readonly logger: winston.Logger;

  constructor(category: string) {
    this.logger = winston.createLogger({
      level: DefaultLevel,
      format: DefaultFormat,
      defaultMeta: { _category: category },
      transports: [
        new winston.transports.Console({
          format: winston.format.simple(),
        }),
      ],
    });
  }

  debug(message: string, metadata?: any): void {
    this.logger.debug(message, metadata, undefined);
  }

  info(message: string, metadata?: any): void {
    this.logger.info(message, metadata, undefined);
  }

  error(message: string, metadata?: any): void {
    this.logger.error(message, metadata, undefined);
  }
}
