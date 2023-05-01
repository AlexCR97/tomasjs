import {
  ClassConstructor,
  Container,
  ContainerSetupFactory,
  ContainerSetupFunction,
} from "@tomasjs/core";
import { Logger } from "@tomasjs/logging";
import { Channel, Options } from "amqplib";
import { QueueMessageHandler } from "./QueueMessageHandler";
import { QueueMessageHandlerMetadata, queueMessageHandlerToken } from "./metadata";
import { channelToken } from "./tokens";

export class UseQueue implements ContainerSetupFactory {
  constructor(
    private readonly options: {
      queueName: string;
      messageHandlers?: ClassConstructor<any>[];
      channel?: Channel;
      assertQueueOptions?: Options.AssertQueue;
      logger?: Logger;
    }
  ) {}

  private get queueName(): string {
    return this.options.queueName;
  }

  private get queueMessageHandlers(): ClassConstructor<any>[] {
    return this.options.messageHandlers ?? [];
  }

  private get logger(): Logger | undefined {
    return this.options.logger;
  }

  create(): ContainerSetupFunction {
    return async (container) => {
      this.bootstrapMessageHandlers(container);
      const channel = await this.openQueueChannelAsync(container);
      this.beginQueueConsumption(container, channel);
    };
  }

  private bootstrapMessageHandlers(container: Container) {
    for (const handler of this.queueMessageHandlers) {
      container.addClass(handler, { token: queueMessageHandlerToken });
    }
  }

  private async openQueueChannelAsync(container: Container): Promise<Channel> {
    this.logger?.info(`Opening queue "${this.queueName}" ...`);
    const channel = this.options.channel ?? container.get<Channel>(channelToken);
    await channel.assertQueue(this.queueName, this.options.assertQueueOptions);
    this.logger?.info(`The queue "${this.queueName}" is ready for consumption.`);
    return channel;
  }

  private beginQueueConsumption(container: Container, channel: Channel) {
    channel.consume(this.queueName, (message) => {
      this.logger?.info(`Received message from queue "${this.queueName}".`);

      if (!message) {
        this.logger?.info("The message was null. No action will be taken.");
        return;
      }

      const messageHandlers = container.getAll<QueueMessageHandler>(queueMessageHandlerToken);
      this.logger?.debug("messageHandlers", { messageHandlers });

      const matchingMessageHandler = messageHandlers.find((ch) => {
        const metadata = new QueueMessageHandlerMetadata(ch);
        return metadata.queueName === this.queueName;
      });
      this.logger?.debug("matchingMessageHandler", { matchingMessageHandler });

      if (!matchingMessageHandler) {
        this.logger?.info("No message handlers were found for the queue.");
        return;
      }

      this.logger?.info("Found message handler for the queue.");
      matchingMessageHandler.handle(channel, message);
    });
  }
}
