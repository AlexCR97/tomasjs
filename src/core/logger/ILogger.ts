export interface ILogger {
  debug(message: string, metadata?: any): void;
  error(message: string, metadata?: any): void;
}
