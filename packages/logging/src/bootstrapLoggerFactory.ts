import { LogLevel } from "./LogLevel";
import { TomasLoggerFactory } from "./TomasLoggerFactory";

export function bootstrapLoggerFactory(level?: LogLevel) {
  return new TomasLoggerFactory().create("bootstrap", level);
}
