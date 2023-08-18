import { Container, Token } from "@tomasjs/core";
import { Logger } from "@tomasjs/logging";

// TODO Move this to @tomasjs/core if needed
export class ServiceResolver {
  constructor(private readonly container: Container, private readonly logger: Logger | undefined) {}

  resolveOrFallback<T>(token: Token<T>, fallback: T): T {
    try {
      this.logger?.debug(`Resolving a service marked with "${token}" ...`);
      const service = this.container.get<T>(token);
      this.logger?.debug("A service was found!");
      return service;
    } catch (error) {
      let errorMessage = error instanceof Error ? error.message : error;
      this.logger?.error(`Could not find a service marked with "${token}".`, { errorMessage });
      this.logger?.debug("The fallback value will be used instead.");
      return fallback;
    }
  }
}
