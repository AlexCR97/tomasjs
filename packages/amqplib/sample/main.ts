import "reflect-metadata";
import { ContainerBuilder, globalContainer } from "@tomasjs/core";
import { TomasLoggerFactory } from "@tomasjs/logging";
import { Channel } from "amqplib";
import { testQueueName, url } from "./env";
import { TestQueueMessageHandler } from "./TestQueueMessageHandler";
import { AddQueueMessageHandlers, AmqplibSetup, ChannelToken, QueueSetup } from "../src";

async function main() {
  const loggerFactory = new TomasLoggerFactory();

  await new ContainerBuilder()
    .setup(new AmqplibSetup({ url, logger: loggerFactory.create(AmqplibSetup.name) }))
    .setup(
      new QueueSetup({
        queueName: testQueueName,
        logger: loggerFactory.create(QueueSetup.name),
      })
    )
    .setup(new AddQueueMessageHandlers([TestQueueMessageHandler]))
    .buildAsync();

  // Send a message after the specified time has passed
  setTimeout(() => {
    const channel = globalContainer.get<Channel>(ChannelToken);
    channel.sendToQueue(testQueueName, Buffer.from("Hello RabbitMQ!"));
  }, 2000);
}

main();
