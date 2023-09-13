import { TomasError } from "@/errors";

export interface GetOptions {
  /**
   * The type of notation to use.
   *
   * E.g., for the following keys, these notations should be used:
   *
   * `"b.c"`: `"."`
   *
   * `"b__c"`: `"__"`
   */
  notation?: string;
}

/**
 * Retrieves a value from an object using a key path. If the key is not found, an error is thrown.
 *
 * E.g.: for the following object:
 *
 * { a: 1, b: { c: 1 } }
 *
 * The following key paths are allowed:
 * `"a"`, `"b.c"`
 *
 * @param source The source object.
 * @param key A key from the source object.
 * @param options Additional options.
 */
export function get<T>(source: any, key: string, options?: GetOptions): T {
  const value = getOrDefault<T>(source, key, options);

  if (value === undefined) {
    throw new TomasError(`No such key "${key}" in source object`, {
      data: {
        source,
        key,
        options,
      },
    });
  }

  return value;
}

/**
 * Retrieves a value from an object using a key path. If the key is not found, undefined is returned.
 *
 * E.g.: for the following object:
 *
 * { a: 1, b: { c: 1 } }
 *
 * The following key paths are allowed:
 * `"a"`, `"b.c"`
 *
 * @param source The source object.
 * @param key A key from the source object.
 * @param options Additional options.
 */
export function getOrDefault<T>(source: any, key: string, options?: GetOptions): T | undefined {
  const defaultNotation = ".";
  const notation = options?.notation ?? defaultNotation;
  const keys = key.split(notation);
  let result = source;

  for (const k of keys) {
    if (result === undefined) {
      return undefined;
    }

    result = result[k];
  }

  return result;
}
