import { ILogger } from "@/core/logger/ILogger";
import winston from "winston";

export class WinstonLogger implements ILogger {
  constructor(private readonly logger: winston.Logger) {}

  debug(message: string, metadata?: any): void {
    this.logger.debug(message, metadata, undefined);
  }

  error(message: string, metadata?: any): void {
    this.logger.error(message, metadata, undefined);
  }
}
