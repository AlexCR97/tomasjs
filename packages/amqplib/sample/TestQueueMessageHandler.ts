import { Channel, Message } from "amqplib";
import { QueueMessageHandler, queueMessageHandler } from "../src";
import { testQueueName } from "./env";

// @ts-ignore
@queueMessageHandler(testQueueName)
export class TestQueueMessageHandler implements QueueMessageHandler {
  handle(channel: Channel, message: Message): void | Promise<void> {
    console.log("Message:", message.content.toString());
  }
}
