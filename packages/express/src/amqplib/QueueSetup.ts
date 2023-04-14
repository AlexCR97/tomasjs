import { Channel, Options } from "amqplib";
import { internalContainer } from "@/container";
import { QueueMessageHandler } from "./QueueMessageHandler";
import { QueueMessageHandlerMetadata, QueueMessageHandlerToken } from "./metadata";
import { Logger } from "@/logger";
import { ContainerSetup, ContainerSetupFactory } from "@/builder";
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
      await this.channel.assertQueue(this.queueName, this.options.assertQueueOptions);

      this.channel.consume(this.queueName, (message) => {
        this.logger?.info(`Received message from queue "${this.queueName}".`);

        if (!message) {
          this.logger?.info("The message was null.");
          return;
        }

        const messageHandlers = container.getAll<QueueMessageHandler>(QueueMessageHandlerToken);

        const matchingMessageHandler = messageHandlers.find((ch) => {
          const metadata = new QueueMessageHandlerMetadata(ch);
          return metadata.queueName === this.queueName;
        });

        if (!matchingMessageHandler) {
          this.logger?.info("No message handlers were found for the queue.");
          return;
        }

        this.logger?.info("Found message handler for the queue.");
        matchingMessageHandler.handle(this.channel, message);
      });
    };
  }
}
