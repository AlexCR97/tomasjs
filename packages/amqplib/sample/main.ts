import "reflect-metadata";
import { ServiceContainerBuilder } from "@tomasjs/core";
import { TomasLoggerFactory } from "@tomasjs/logging";
import { Channel } from "amqplib";
import { testQueueName, url } from "./env";
import { TestQueueMessageHandler } from "./TestQueueMessageHandler";
import { AddQueueMessageHandlers, AmqplibSetup, QueueSetup, channelToken } from "../src";

async function main() {
  const loggerFactory = new TomasLoggerFactory();

  const services = await new ServiceContainerBuilder()
    .setup(new AmqplibSetup({ url, logger: loggerFactory.create(AmqplibSetup.name) }))
    .setup(
      new QueueSetup({
        queueName: testQueueName,
        logger: loggerFactory.create(QueueSetup.name),
      })
    )
    .setup(new AddQueueMessageHandlers([TestQueueMessageHandler]))
    .buildServiceProviderAsync();

  // Send a message after the specified time has passed
  setTimeout(() => {
    const channel = services.get<Channel>(channelToken);
    channel.sendToQueue(testQueueName, Buffer.from("Hello RabbitMQ!"));
  }, 2000);
}

main();
