import { Channel, Options } from "amqplib";
import { ContainerSetup, ContainerSetupFactory } from "@tomasjs/express/builder";
import { IContainer, internalContainer } from "@tomasjs/express/container";
import { Logger } from "@tomasjs/express/logger";
import { QueueMessageHandler } from "./QueueMessageHandler";
import { QueueMessageHandlerMetadata, QueueMessageHandlerToken } from "./metadata";
import { ChannelToken } from "./tokens";

export class QueueSetup extends ContainerSetupFactory {
  constructor(
    private readonly options: {
      queueName: string;
      channel?: Channel;
      assertQueueOptions?: Options.AssertQueue;
      logger?: Logger;
    }
  ) {
    super();
  }

  private get queueName(): string {
    return this.options.queueName;
  }

  private get channel(): Channel {
    return this.options.channel ?? internalContainer.get<Channel>(ChannelToken);
  }

  private get logger(): Logger | undefined {
    return this.options.logger;
  }

  create(): ContainerSetup {
    return async (container) => {
      this.logger?.info(`Opening queue "${this.queueName}" ...`);
      await this.channel.assertQueue(this.queueName, this.options.assertQueueOptions);
      this.logger?.info(`The queue "${this.queueName}" is ready for consumption.`);
      this.beginChannelConsumption(container);
    };
  }

  private getQueueMessageHandlers(container: IContainer): QueueMessageHandler[] {
    try {
      return container.getAll<QueueMessageHandler>(QueueMessageHandlerToken);
    } catch (err) {
      return [];
    }
  }

  private beginChannelConsumption(container: IContainer) {
    this.channel.consume(this.queueName, (message) => {
      this.logger?.info(`Received message from queue "${this.queueName}".`);

      if (!message) {
        this.logger?.info("The message was null. No action will be taken.");
        return;
      }

      const messageHandlers = this.getQueueMessageHandlers(container);
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
      matchingMessageHandler.handle(this.channel, message);
    });
  }
}
