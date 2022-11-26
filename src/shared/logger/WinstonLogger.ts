import winston from "winston";
import { ILogger } from "./ILogger";

export class WinstonLogger implements ILogger {
  constructor(private readonly logger: winston.Logger) {}

  debug(message: string, metadata: any): void {
    this.logger.debug(message, metadata, undefined);
  }
}
