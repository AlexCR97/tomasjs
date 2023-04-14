import { Channel, Message } from "amqplib";

export interface QueueMessageHandler {
  handle(channel: Channel, message: Message): void | Promise<void>;
}
