export class TokenBuilder {
  private readonly parts: string[] = [];

  with(part: string | undefined | null): TokenBuilder {
    if (part !== undefined && part !== null && part.trim().length > 0) {
      this.parts.push(part);
    }

    return this;
  }

  build(): string {
    return this.parts.join(":");
  }
}
