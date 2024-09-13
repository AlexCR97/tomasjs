/**
 * Flattens a nested array into a one-dimensional array.
 *
 * This function takes an array that may contain nested arrays and recursively
 * flattens it into a single-level array.
 *
 * @template T The type of elements in the array.
 * @param {any[]} arr - The array to be flattened. It can contain nested arrays of any depth.
 * @returns {T[]} A new array that is a flattened version of the input array.
 *
 * @example
 * const arr = [1, [2, [3, 4], 5], 6];
 * const result = flatten<number>(arr);
 * // result is [1, 2, 3, 4, 5, 6]
 *
 * @example
 * const arr = ['a', ['b', ['c', 'd'], 'e'], 'f'];
 * const result = flatten<string>(arr);
 * // result is ['a', 'b', 'c', 'd', 'e', 'f']
 */
export function flatten<T>(arr: any[]): T[] {
  const flattened: any[] = [];

  arr.forEach((item) => {
    if (Array.isArray(item)) {
      flattened.push(...flatten(item));
    } else {
      flattened.push(item);
    }
  });

  return flattened;
}
