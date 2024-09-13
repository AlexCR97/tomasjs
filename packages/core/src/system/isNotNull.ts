/**
 * Determines whether the provided object is not `null` or `undefined`.
 *
 * @template T The type of the object to check.
 * @param {T} obj - The object to check.
 * @returns {obj is NonNullable<T>} Returns `true` if the object is neither `null` nor `undefined`; otherwise, `false`.
 *
 * @example
 * const result = isNotNull(42);
 * // result is true
 *
 * @example
 * const result = isNotNull(null);
 * // result is false
 *
 * @example
 * const result = isNotNull(undefined);
 * // result is false
 */
export function isNotNull<T>(obj: T): obj is NonNullable<T> {
  return obj !== undefined && obj !== null;
}
