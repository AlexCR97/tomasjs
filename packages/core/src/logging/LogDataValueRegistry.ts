import { pipe, Predicate } from "@/system";
import { ConsoleColor, escape } from "@/system/console";
import { ILogDataValue } from "./LogData";
import { isLogLevel, LogLevel } from "./LogLevel";

export type LogDataValueFactory<T> = (value: T) => ILogDataValue<T>;

export type LogDataValueRegistryEntry<T> = {
  predicate: Predicate<T>;
  factory: LogDataValueFactory<T>;
};

const registry: LogDataValueRegistryEntry<unknown>[] = [];

export const LogDataValueRegistry = {
  clear() {
    registry.splice(0, registry.length);
  },

  count(): number {
    return registry.length;
  },

  forEach(func: (value: LogDataValueRegistryEntry<unknown>, index: number) => void) {
    registry.forEach((value, index) => func(value, index));
  },

  reset() {
    this.clear();

    // Order matters!
    this.when<object>((v) => typeof v === "object").use((v) => new ObjectLogData(v));
    this.when<Date>((v) => v instanceof Date).use((v) => new DateLogData(v));
    this.when<string>((v) => typeof v === "string").use((v) => new StringLogData(v));
    this.when<LogLevel>((v) => isLogLevel(v)).use((v) => new LogLevelLogData(v));
    this.when<number>((v) => typeof v === "number").use((v) => new NumberLogData(v));
    this.when<boolean>((v) => typeof v === "boolean").use((v) => new BooleanLogData(v));
  },

  when<T>(predicate: Predicate<T>) {
    return {
      use(factory: LogDataValueFactory<T>) {
        registry.push({
          predicate: predicate as Predicate<unknown>,
          factory: factory as LogDataValueFactory<unknown>,
        });
      },
    } as const;
  },
} as const;

// Initialize the registry
LogDataValueRegistry.reset();

export const LogDataValue = {
  for<T>(value: T): ILogDataValue<T> {
    const result = registry.findLast(({ predicate }) => predicate(value));
    const logData = result === undefined ? new UnknownLogData(value) : result.factory(value);
    return logData as ILogDataValue<T>;
  },
} as const;

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

class LogLevelLogData implements ILogDataValue<LogLevel> {
  constructor(readonly value: LogLevel) {}

  toString(): string {
    const color = this.logLevelColor[this.value];
    const levelDisplay = this.logLevelDisplayMap[this.value];
    return escape(color, levelDisplay);
  }

  private readonly logLevelColor: Record<LogLevel, ConsoleColor> = {
    verbose: "blue",
    debug: "cyan",
    info: "green",
    warn: "yellow",
    error: "orange",
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

class ObjectLogData implements ILogDataValue<object> {
  constructor(readonly value: object) {}

  toString(): string {
    return JSON.stringify(this.value);
  }
}

class UnknownLogData implements ILogDataValue<unknown> {
  constructor(readonly value: unknown) {}

  toString(): string {
    return `${this.value}`;
  }
}
