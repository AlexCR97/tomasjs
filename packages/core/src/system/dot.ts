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
