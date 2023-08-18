import { Logger } from "./Logger";
import { LogLevel } from "./LogLevel";

export interface LoggerFactory {
  create(category: string, level?: LogLevel): Logger;
}
