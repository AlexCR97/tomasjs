export interface Logger {
  error(message: string, data?: any): void;
  warn(message: string, data?: any): void;
  info(message: string, data?: any): void;
  verbose(message: string, data?: any): void;
  debug(message: string, data?: any): void;
}
