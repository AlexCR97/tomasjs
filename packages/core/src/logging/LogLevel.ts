export const LOG_LEVELS = ["verbose", "debug", "info", "warn", "error", "fatal"] as const;

export type LogLevel = (typeof LOG_LEVELS)[number];

const LOG_LEVEL_WEIGHT: Record<LogLevel, number> = {
  verbose: 0,
  debug: 1,
  info: 2,
  warn: 3,
  error: 4,
  fatal: 5,
};

export function compareLogLevel(a: LogLevel, b: LogLevel): number {
  return LOG_LEVEL_WEIGHT[a] - LOG_LEVEL_WEIGHT[b];
}

export function isLogLevel(obj: any): obj is LogLevel {
  return LOG_LEVELS.includes(obj);
}
