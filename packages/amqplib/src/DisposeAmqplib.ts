import { ContainerTeardownFactory, ContainerTeardownFunction } from "@tomasjs/core";
import { Connection } from "amqplib";
import { connectionToken } from "./tokens";
import { Logger } from "@tomasjs/logging";

export class DisposeAmqplib implements ContainerTeardownFactory {
  constructor(private readonly options?: { logger?: Logger }) {}

  private get logger(): Logger | undefined {
    return this.options?.logger;
  }

  create(): ContainerTeardownFunction {
    return async (container) => {
      this.logger?.info("Resolving connection ...");
      const connection = container.getOrDefault<Connection>(connectionToken);

      if (!connection) {
        this.logger?.info("A connection was not found.");
        return;
      }

      this.logger?.info("Closing connection ...");
      await connection.close();
      this.logger?.info("Connection closed.");
    };
  }
}
