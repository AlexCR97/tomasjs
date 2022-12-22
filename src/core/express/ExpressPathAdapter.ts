export abstract class ExpressPathAdapter {
  private constructor() {}

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
