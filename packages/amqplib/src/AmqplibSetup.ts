import { ContainerSetupFactory, ContainerSetupFunction } from "@tomasjs/core";
import { Logger } from "@tomasjs/logging";
import amqp, { Channel, Connection, Options } from "amqplib";
import { channelToken, connectionToken } from "./tokens";

export class AmqplibSetup implements ContainerSetupFactory {
  constructor(
    private readonly options: {
      url: string | Options.Connect;
      socketOptions?: any;
      logger?: Logger;
    }
  ) {}

  private get logger(): Logger | undefined {
    return this.options.logger;
  }

  create(): ContainerSetupFunction {
    return async (container) => {
      const connection = await this.establishConnectionAsync();
      container.addInstance(connection, connectionToken);

      const defaultChannel = await this.openDefaultChannelAsync(connection);
      container.addInstance(defaultChannel, channelToken);
    };
  }

  private async establishConnectionAsync(): Promise<Connection> {
    this.logger?.info(`Connecting to server ${this.options.url} ...`);
    const connection = await amqp.connect(this.options.url, this.options.socketOptions);
    this.logger?.info("Connection established.");
    return connection;
  }

  private async openDefaultChannelAsync(connection: Connection): Promise<Channel> {
    this.logger?.info("Opening a default channel ...");
    const channel = await connection.createChannel();
    this.logger?.info("Default channel opened.");
    return channel;
  }
}
