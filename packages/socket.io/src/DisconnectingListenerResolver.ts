import { Container } from "@tomasjs/core";
import { Logger, TomasLoggerFactory } from "@tomasjs/logging";
import { DisconnectingListener } from "./DisconnectingListener";
import { disconnectingListenerToken } from "./disconnectingListenerToken";
import { FallbackDisconnectingListener } from "./FallbackDisconnectingListener";

export class DisconnectingListenerResolver {
  constructor(private readonly container: Container, private readonly logger: Logger | undefined) {}

  resolve(): DisconnectingListener {
    try {
      this.logger?.debug("Resolving an instance of a DisconnectingListener ...");

      const disconnectingListener = this.container.get<DisconnectingListener>(
        disconnectingListenerToken
      );

      this.logger?.debug("An instance was found!");

      return disconnectingListener;
    } catch (error) {
      let errorMessage = error instanceof Error ? error.message : error;

      this.logger?.error("Could not find an instance of a DisconnectingListener.", {
        errorMessage,
      });

      this.logger?.debug("The fallback DisconnectingListener will be used instead.");

      return new FallbackDisconnectingListener(new TomasLoggerFactory());
    }
  }
}
