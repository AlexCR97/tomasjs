/**
 * Merges multiple objects into a single object.
 *
 * This function takes an array of objects and combines their properties into a single object.
 * If multiple objects have properties with the same key, the value from the last object with
 * that key will overwrite the previous ones.
 *
 * @param {Record<any, any>[]} objs - An array of objects to be merged.
 * @returns {Record<any, any>} A new object that contains all properties from the input objects.
 * Properties from later objects in the array overwrite those from earlier objects.
 *
 * @example
 * const obj1 = { a: 1, b: 2 };
 * const obj2 = { b: 3, c: 4 };
 * const result = merge([obj1, obj2]);
 * // result is { a: 1, b: 3, c: 4 }
 *
 * @example
 * const obj1 = { name: 'Alice' };
 * const obj2 = { age: 30 };
 * const result = merge([obj1, obj2]);
 * // result is { name: 'Alice', age: 30 }
 */
export function merge(objs: Record<any, any>[]): Record<any, any> {
  const merged: Record<any, any> = {};

  for (const obj of objs) {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        merged[key] = obj[key];
      }
    }
  }

  return merged;
}
