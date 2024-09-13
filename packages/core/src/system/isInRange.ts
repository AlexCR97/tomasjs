/**
 * Checks if a number is within a specified range, inclusive.
 *
 * This function determines whether the provided `num` falls within the range defined
 * by `min` and `max` (inclusive).
 *
 * @param {number} num - The number to check.
 * @param {number} min - The minimum value of the range.
 * @param {number} max - The maximum value of the range.
 * @returns {boolean} Returns `true` if `num` is greater than or equal to `min` and less than or equal to `max`, otherwise `false`.
 *
 * @example
 * const result = isInRange(5, 1, 10);
 * // result is true
 *
 * @example
 * const result = isInRange(15, 1, 10);
 * // result is false
 */
export function isInRange(num: number, min: number, max: number): boolean {
  return num >= min && num <= max;
}
