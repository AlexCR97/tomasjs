import { readJsonFile } from "@/files";
import { LogLevel } from "./LogLevel";

export interface GlobalLoggingOptions {
  minimumLevel?: {
    default?: LogLevel;
    override?: {
      [key: string]: LogLevel;
    };
  };
}

let _options: GlobalLoggingOptions = {};

export const globalLoggingOptions = {
  clear(): void {
    _options = {};
  },
  from: {
    file(path: string): void {
      _options = readJsonFile(path);
    },
    options(options: GlobalLoggingOptions): void {
      _options = options;
    },
  },
  minimumLevel: {
    default(level: LogLevel): void {
      _options.minimumLevel = _options.minimumLevel ?? {};
      _options.minimumLevel.default = level;
    },
    override(category: string, level: LogLevel): void {
      _options.minimumLevel = _options.minimumLevel ?? {};
      _options.minimumLevel.override = _options.minimumLevel.override ?? {};
      _options.minimumLevel.override[category] = level;
    },
  },
  value(): GlobalLoggingOptions {
    return _options;
  },
} as const;
