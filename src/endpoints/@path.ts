export function path(path: string) {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    return class extends constructor {
      _endpoint_path = path;
    };
  };
}
