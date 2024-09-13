/**
 * Retrieves the value at a nested property of an object using a dot-separated path.
 *
 * This function allows accessing deep properties of an object by providing a dot-separated
 * string path. If any part of the path does not exist, or the value is `null` or `undefined`,
 * the function returns `null` or `undefined`.
 *
 * @template T The expected type of the value at the given path.
 * @param {Record<any, any>} obj The object from which to retrieve the nested value.
 * @param {string} path A dot-separated string representing the path to the desired property.
 * @returns {T | null | undefined} The value of type {@link T} at the given path, or `null`/`undefined` if the path does not exist.
 *
 * @example
 * const obj = { a: { b: { c: 42 } } };
 * const result = dot<number>(obj, 'a.b.c');
 * // result is 42
 *
 * @example
 * const obj = { a: { b: { } } };
 * const result = dot<number>(obj, 'a.b.c');
 * // result is undefined
 */
export function dot<T>(obj: Record<any, any>, path: string): T | null | undefined {
  const keys = path.split(".");
  let current = obj;

  for (const key of keys) {
    current = current[key];

    if (current === null || current === undefined) {
      return current;
    }
  }

  return current;
}
