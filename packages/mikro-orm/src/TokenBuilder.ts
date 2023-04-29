// TODO Move this class to @tomasjs/core if needed

export class TokenBuilder {
  private readonly parts: string[] = [];

  add(part: string): TokenBuilder {
    this.parts.push(part);
    return this;
  }

  addIfNotEmpty(part: string | undefined | null): TokenBuilder {
    if (part !== undefined && part !== null && part.trim().length > 0) {
      this.parts.push(part);
    }

    return this;
  }

  build(): string {
    return this.parts.join(":");
  }
}
