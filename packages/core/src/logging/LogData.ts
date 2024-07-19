import { InvalidOperationError } from "@/errors";
import { pipe } from "@/system";
import { isLogLevel, LogLevel } from "./LogLevel";

export type LogData = Record<string, unknown>;

export interface ILogDataValue<T> {
  value: T;
  toString(): string;
}

export class LogDataValue {
  static from<T>(value: T, options?: { colorize?: boolean }): ILogDataValue<T> {
    const colorize = options?.colorize ?? false;

    if (typeof value === "boolean") {
      return pipe(value)
        .pipe((value) => new BooleanLogData(value))
        .pipe((logData) => (colorize ? new ColoredLogData("magenta", logData) : logData))
        .get() as unknown as ILogDataValue<T>;
    }

    if (typeof value === "number") {
      return pipe(value)
        .pipe((value) => new NumberLogData(value))
        .pipe((logData) => (colorize ? new ColoredLogData("magenta", logData) : logData))
        .get() as unknown as ILogDataValue<T>;
    }

    if (typeof value === "string") {
      if (isLogLevel(value)) {
        return new LogLevelLogData(value) as unknown as ILogDataValue<T>;
      }

      return pipe(value)
        .pipe((value) => new StringLogData(value))
        .pipe((logData) => (colorize ? new ColoredLogData("magenta", logData) : logData))
        .get() as unknown as ILogDataValue<T>;
    }

    if (value instanceof Date) {
      return pipe(value)
        .pipe((value) => new DateLogData(value))
        .pipe((logData) => (colorize ? new ColoredLogData("magenta", logData) : logData))
        .get() as unknown as ILogDataValue<T>;
    }

    if (typeof value === "object") {
      return pipe(value)
        .pipe((value) => new ObjectLogData(value as any))
        .pipe((logData) => (colorize ? new ColoredLogData("magenta", logData) : logData))
        .get() as unknown as ILogDataValue<T>;
    }

    // TODO Create UnknownLogDataValue
    throw new InvalidOperationError();
  }
}

class BooleanLogData implements ILogDataValue<boolean> {
  constructor(readonly value: boolean) {}

  toString(): string {
    return `${this.value}`;
  }
}

class NumberLogData implements ILogDataValue<number> {
  constructor(readonly value: number) {}

  toString(): string {
    return this.value.toString();
  }
}

class StringLogData implements ILogDataValue<string> {
  constructor(readonly value: string) {}

  toString(): string {
    return this.value;
  }
}

class DateLogData implements ILogDataValue<Date> {
  constructor(readonly value: Date) {}

  toString(): string {
    return pipe(this.value.toISOString())
      .pipe((isoString) => isoString.split("T"))
      .pipe((isoParts) => isoParts[1])
      .pipe((timePart) => timePart.slice(0, timePart.length - 1))
      .get();
  }
}

class LogLevelLogData implements ILogDataValue<LogLevel> {
  constructor(readonly value: LogLevel) {}

  toString(): string {
    const color = this.logLevelColor[this.value];
    const colorEscape = colorEscapes[color];
    const levelDisplay = this.logLevelDisplayMap[this.value];
    return `${colorEscape}${levelDisplay}${colorEscapes.reset}`;
  }

  private readonly logLevelColor: Record<LogLevel, keyof typeof colorEscapes> = {
    debug: "blue",
    verbose: "cyan",
    info: "green",
    warn: "yellow",
    error: "red",
    fatal: "red",
  };

  private readonly logLevelDisplayMap: Record<LogLevel, string> = {
    verbose: "VRB",
    debug: "DBG",
    info: "INF",
    warn: "WRN",
    error: "ERR",
    fatal: "FTL",
  };
}

class ObjectLogData implements ILogDataValue<object> {
  constructor(readonly value: object) {}

  toString(): string {
    return JSON.stringify(this.value);
  }
}

class ColoredLogData<T> implements ILogDataValue<T> {
  constructor(readonly color: Color, readonly wrapped: ILogDataValue<T>) {}

  get value(): T {
    return this.wrapped.value;
  }

  toString(): string {
    const colorEscape = colorEscapes[this.color];
    const valueStr = this.wrapped.toString();
    return `${colorEscape}${valueStr}${colorEscapes.reset}`;
  }
}

const colorEscapes = {
  reset: "\x1b[0m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  magenta: "\x1b[35m",
} as const;

type Color = keyof typeof colorEscapes;
