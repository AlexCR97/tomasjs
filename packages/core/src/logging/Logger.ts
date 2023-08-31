export interface Logger {
  debug(message: any, ...params: any[]): void;
  verbose(message: any, ...params: any[]): void;
  info(message: any, ...params: any[]): void;
  warn(message: any, ...params: any[]): void;
  error(message: any, ...params: any[]): void;
}
