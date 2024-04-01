/**
 * Merges multiple objects into a single object.
 * @param objs The objects to merge
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
