import "reflect-metadata";
import { ServiceContainerBuilder } from "@tomasjs/core";
import { TomasLoggerFactory } from "@tomasjs/logging";
import { Channel } from "amqplib";
import { testQueueName, url } from "./env";
import { TestQueueMessageHandler } from "./TestQueueMessageHandler";
import { UseAmqplib, UseQueue, channelToken } from "../src";
import { tick } from "../src/tests/utils";

async function main() {
  const loggerFactory = new TomasLoggerFactory();

  const services = await new ServiceContainerBuilder()
    .setup(new UseAmqplib({ url, logger: loggerFactory.create(UseAmqplib.name) }))
    .setup(
      new UseQueue({
        queueName: testQueueName,
        messageHandlers: [TestQueueMessageHandler],
        logger: loggerFactory.create(UseQueue.name),
      })
    )
    .buildServiceProviderAsync();

  // Send a message after the specified time has passed
  tick(2000).then(() => {
    const channel = services.get<Channel>(channelToken);
    channel.sendToQueue(testQueueName, Buffer.from("Hello RabbitMQ!"));
  });
}

main();
