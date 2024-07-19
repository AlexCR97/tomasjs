export type LogData = Record<string, unknown>;

export interface ILogDataValue<T> {
  value: T;
  toString(): string;
}
