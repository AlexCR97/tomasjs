/**
 * Represents a grouped collection where the keys are strings, and the values are arrays of items.
 *
 * @template T The type of the elements in each group.
 */
export type Grouped<T> = {
  [key: string]: T[];
};

/**
 * Groups an array of objects by a specific key.
 *
 * This function takes an array of objects and groups them by the value of a specified key.
 * The returned object will have keys corresponding to the values of the specified key,
 * with each key pointing to an array of objects that share that key value.
 *
 * @template T The type of objects in the array.
 * @param {T[]} array - The array of objects to be grouped.
 * @param {keyof T} key - The key used to group the objects.
 * @returns {Grouped<T>} An object where each key is a string corresponding to a value of the specified key,
 * and each value is an array of objects that share that key.
 *
 * @example
 * const people = [
 *   { name: 'Alice', age: 30 },
 *   { name: 'Bob', age: 25 },
 *   { name: 'Charlie', age: 30 }
 * ];
 * const result = groupBy(people, 'age');
 * // result is { '30': [{ name: 'Alice', age: 30 }, { name: 'Charlie', age: 30 }], '25': [{ name: 'Bob', age: 25 }] }
 *
 * @example
 * const fruits = [
 *   { name: 'Apple', type: 'fruit' },
 *   { name: 'Carrot', type: 'vegetable' },
 *   { name: 'Banana', type: 'fruit' }
 * ];
 * const result = groupBy(fruits, 'type');
 * // result is { 'fruit': [{ name: 'Apple', type: 'fruit' }, { name: 'Banana', type: 'fruit' }], 'vegetable': [{ name: 'Carrot', type: 'vegetable' }] }
 */
export function groupBy<T extends Record<string, any>>(array: T[], key: keyof T): Grouped<T> {
  return array.reduce((result, currentItem) => {
    const groupKey = String(currentItem[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(currentItem);
    return result;
  }, {} as Grouped<T>);
}
