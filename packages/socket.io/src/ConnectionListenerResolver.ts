import { Container } from "@tomasjs/core";
import { Logger, TomasLoggerFactory } from "@tomasjs/logging";
import { ConnectionListener } from "./ConnectionListener";
import { connectionListenerToken } from "./connectionListenerToken";
import { FallbackConnectionListener } from "./FallbackConnectionListener";

export class ConnectionListenerResolver {
  constructor(private readonly container: Container, private readonly logger: Logger | undefined) {}

  resolve(): ConnectionListener {
    try {
      this.logger?.debug("Resolving an instance of a ConnectionListener ...");
      const connectionListener = this.container.get<ConnectionListener>(connectionListenerToken);
      this.logger?.debug("An instance was found!");
      return connectionListener;
    } catch (error) {
      let errorMessage = error instanceof Error ? error.message : error;
      this.logger?.error("Could not find an instance of a ConnectionListener.", { errorMessage });
      this.logger?.debug("The fallback ConnectionListener will be used instead.");
      return new FallbackConnectionListener(new TomasLoggerFactory());
    }
  }
}
