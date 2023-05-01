import { ContainerSetupFactory, ContainerSetupFunction } from "@tomasjs/core";
import { Logger } from "@tomasjs/logging";
import amqp, { Channel, Connection, Options } from "amqplib";
import { channelToken, connectionToken } from "./tokens";
import { OnConnectedFunction } from "./OnConnectedFunction";
import { OnDefaultChannelOpenedFunction } from "./OnDefaultChannelOpenedFunction";
import { OnBootstrappedFunction } from "./OnBootstrappedFunction";

export class UseAmqplib implements ContainerSetupFactory {
  constructor(
    private readonly options: {
      url: string | Options.Connect;
      socketOptions?: any;
      logger?: Logger;
      onConnected?: OnConnectedFunction;
      onDefaultChannelOpened?: OnDefaultChannelOpenedFunction;
      onBootstrapped?: OnBootstrappedFunction;
    }
  ) {}

  private get logger(): Logger | undefined {
    return this.options.logger;
  }

  create(): ContainerSetupFunction {
    return async (container) => {
      const connection = await this.establishConnectionAsync();
      container.addInstance(connection, connectionToken);
      await this.tryInvokeOnConnectedFunctionAsync(connection);

      const defaultChannel = await this.openDefaultChannelAsync(connection);
      container.addInstance(defaultChannel, channelToken);
      await this.tryInvokeOnDefaultChannelOpenedAsync(defaultChannel);

      this.logger?.info("Amqplib has been successfully bootstrapped.");
      await this.tryInvokeOnBootstrappedAsync(connection, defaultChannel);
    };
  }

  private async establishConnectionAsync(): Promise<Connection> {
    this.logger?.info(`Connecting to message broker ${this.options.url} ...`);
    const connection = await amqp.connect(this.options.url, this.options.socketOptions);
    this.logger?.info("Connection established.");
    return connection;
  }

  private async tryInvokeOnConnectedFunctionAsync(connection: Connection) {
    if (this.options.onConnected) {
      await this.options.onConnected(connection);
    }
  }

  private async openDefaultChannelAsync(connection: Connection): Promise<Channel> {
    this.logger?.info("Opening a default channel ...");
    const channel = await connection.createChannel();
    this.logger?.info("Default channel opened.");
    return channel;
  }

  private async tryInvokeOnDefaultChannelOpenedAsync(channel: Channel) {
    if (this.options.onDefaultChannelOpened) {
      await this.options.onDefaultChannelOpened(channel);
    }
  }

  private async tryInvokeOnBootstrappedAsync(connection: Connection, channel: Channel) {
    if (this.options.onBootstrapped) {
      await this.options.onBootstrapped(connection, channel);
    }
  }
}
