import { Container, Token } from "@tomasjs/core";
import { Logger } from "@tomasjs/logging";

export class ServiceResolver {
  constructor(private readonly container: Container, private readonly logger: Logger | undefined) {}

  resolveOrFallback<T>(token: Token<T>, fallback: T): T {
    try {
      this.logger?.debug(`Resolving a service marked with of "${token}" ...`);
      const service = this.container.get<T>(token);
      this.logger?.debug("A service was found!");
      return service;
    } catch (error) {
      let errorMessage = error instanceof Error ? error.message : error;
      this.logger?.error(`Could not find a service marked with "${token}".`, { errorMessage });
      this.logger?.debug("The fallback DisconnectingListener will be used instead.");
      return fallback;
    }
  }
}
