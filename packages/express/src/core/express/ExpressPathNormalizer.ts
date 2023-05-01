export class ExpressPathNormalizer {
  constructor(private readonly path: string | undefined) {}

  normalize(): string {
    if (
      this.path === undefined ||
      this.path === null ||
      this.path.trim().length === 0 ||
      this.path === "/"
    ) {
      return "/";
    }

    if (this.path.startsWith("/")) {
      return this.path;
    }

    return `/${this.path}`;
  }
}
