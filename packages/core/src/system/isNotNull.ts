export function isNotNull<T>(obj: T): obj is NonNullable<T> {
  return obj !== undefined && obj !== null;
}
