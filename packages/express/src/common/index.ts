// TODO Move this to @tomasjs/core/reflection
export function removeKey<TObj extends object, TKey extends keyof TObj>(
  obj: TObj,
  key: TKey
): Omit<TObj, TKey> {
  const objWithoutKey = { ...obj };

  if (key in objWithoutKey) {
    delete objWithoutKey[key];
  }

  return objWithoutKey;
}
