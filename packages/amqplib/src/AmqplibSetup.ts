import amqp, { Channel, Connection, Options } from "amqplib";
import { ContainerSetup, ContainerSetupFactory } from "@tomasjs/express/builder";
import { ChannelToken, ConnectionToken } from "./tokens";
import { Logger } from "@tomasjs/express/logger";

export class AmqplibSetup extends ContainerSetupFactory {
  constructor(
    private readonly options: {
      url: string | Options.Connect;
      socketOptions?: any;
      logger?: Logger;
    }
  ) {
    super();
  }

  private get logger(): Logger | undefined {
    return this.options.logger;
  }

  create(): ContainerSetup {
    return async (container) => {
      const connection = await this.establishConnectionAsync();
      container.addInstance(connection, ConnectionToken);

      const defaultChannel = await this.openDefaultChannelAsync(connection);
      container.addInstance(defaultChannel, ChannelToken);
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
