import "reflect-metadata";
import { describe, beforeEach, afterEach, it, expect } from "@jest/globals";
import { ClassConstructor, Container, ServiceContainerBuilder } from "@tomasjs/core";
import { TomasLogger } from "@tomasjs/logging";
import { queueMessageHandler } from "./@queueMessageHandler";
import { DisposeAmqplib } from "./DisposeAmqplib";
import { QueueMessageHandler } from "./QueueMessageHandler";
import { UseAmqplib } from "./UseAmqplib";
import { UseQueue } from "./UseQueue";
import { UseQueueMessageHandlers } from "./UseQueueMessageHandlers";
import { Channel, Message } from "amqplib";
import { channelToken } from "./tokens";

describe("UseQueue", () => {
  let pubContainer: Container;
  let subContainer: Container;
  const queueName = "test-queue";

  beforeEach(async () => {
    await tryDisposeAsync(pubContainer);
    await tryDisposeAsync(subContainer);
  });

  afterEach(async () => {
    await tryDisposeAsync(pubContainer);
    await tryDisposeAsync(subContainer);
  });

  it("Can consume a queue using a QueueMessageHandler", (done) => {
    const messageForQueue = "Tom says hello! I mean... meow!";

    //@ts-ignore: Fix decorators not working in test files
    @queueMessageHandler(queueName)
    class TestQueueMessageHandler implements QueueMessageHandler {
      handle(channel: Channel, queueMessage: Message): void | Promise<void> {
        expect(channel).toBeTruthy();
        expect(queueMessage.content.toString()).toEqual(messageForQueue);
        channel.ackAll(); // De-queue all message to prevent multiple calls to this handler
        done(); // Test will pass if the message was received in the sub-server
      }
    }

    mockPubServerAsync().then((container) => {
      pubContainer = container;
      const defaultChannel = container.get<Channel>(channelToken);
      defaultChannel.sendToQueue(queueName, Buffer.from(messageForQueue));
    });

    mockSubServerAsync({
      messageHandler: TestQueueMessageHandler,
    }).then((container) => {
      subContainer = container;
    });
  });

  async function tryDisposeAsync(container: Container | undefined) {
    if (container) {
      const teardownFunction = new DisposeAmqplib().create();
      await teardownFunction(container);
    }
  }

  async function mockPubServerAsync(): Promise<Container> {
    const url = "amqp://localhost";
    const logger = new TomasLogger("PubServer", "debug");

    return await new ServiceContainerBuilder()
      .setup(
        new UseAmqplib({
          url,
          logger,
        })
      )
      .buildContainerAsync();
  }

  async function mockSubServerAsync(options: {
    messageHandler: ClassConstructor<QueueMessageHandler>;
  }): Promise<Container> {
    const url = "amqp://localhost";
    const logger = new TomasLogger("SubServer", "debug");

    return await new ServiceContainerBuilder()
      .setup(
        new UseAmqplib({
          url,
          logger,
        })
      )
      .setup(new UseQueue({ queueName, logger }))
      .setup(new UseQueueMessageHandlers([options.messageHandler]))
      .buildContainerAsync();
  }
});
