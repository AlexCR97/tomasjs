export type Grouped<T> = {
  [key: string]: T[];
};

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
