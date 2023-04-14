import "reflect-metadata";
import { Channel } from "amqplib";
import { ContainerBuilder } from "tomasjs/builder";
import { internalContainer } from "tomasjs/container";
import { TomasLogger } from "tomasjs/logger";
import { testQueueName, url } from "./env";
import { TestQueueMessageHandler } from "./TestQueueMessageHandler";
import { AddQueueMessageHandlers, AmqplibSetup, ChannelToken, QueueSetup } from "../src";

const logger = new TomasLogger("main", "info");

async function main() {
  await new ContainerBuilder()
    .setup(new AmqplibSetup({ url, logger }))
    .setup(new QueueSetup({ queueName: testQueueName, logger }))
    .setup(new AddQueueMessageHandlers([TestQueueMessageHandler]))
    .buildAsync();

  // Send a message after the specified time has passed
  setTimeout(() => {
    const channel = internalContainer.get<Channel>(ChannelToken);
    channel.sendToQueue(testQueueName, Buffer.from("Hello RabbitMQ!"));
  }, 2000);
}

main();
