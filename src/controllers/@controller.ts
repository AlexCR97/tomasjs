export function controller(path?: string) {
  return function <T extends new (...args: any[]) => any>(constructor: T) {
    // TODO Implement controller decorator
  };
}
