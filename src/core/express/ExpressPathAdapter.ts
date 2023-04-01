/**
 * The `ExpressPathAdapter` class provides a utility method for adapting a path string
 * to the expected format used by Express.js.
 */
export abstract class ExpressPathAdapter {
  /**
   * Private constructor to prevent instantiation of this class.
   * @private
   */
  private constructor() {}

  /**
   * Adapts the specified path to the expected format used by Express.js.
   *
   * @param path The path string to adapt.
   * @returns The adapted path string.
   */
  static adapt(path: string | undefined): string {
    if (path === undefined || path === null || path.trim().length === 0 || path === "/") {
      return "/";
    }

    if (path.startsWith("/")) {
      return path;
    }

    return `/${path}`;
  }
}
