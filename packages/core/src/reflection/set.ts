export interface SetOptions {
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
 * Sets the value of a key from an object.
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
 * @param value The value to set into the source object's key
 * @param options Additional options.
 */
export function set(source: any, key: string, value: any, options?: SetOptions) {
  const notation = options?.notation ?? ".";
  const keys = key.split(notation);

  if (keys.length === 1) {
    source[key] = value;
    return;
  }

  let current = source;
  for (let i = 0; i < keys.length - 1; i++) {
    const currentKey = keys[i];
    if (!current[currentKey]) {
      // Create nested objects if they don't exist.
      current[currentKey] = {};
    }
    current = current[currentKey];
  }
  // Set the value in the final nested object.
  current[keys[keys.length - 1]] = value;
}
