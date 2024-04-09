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
