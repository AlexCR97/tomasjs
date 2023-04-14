import { Channel, Message } from "amqplib";

export interface QueueMessageHandler {
  handle(channel: Channel, message: Message): void | Promise<void>;
}

export const queueMessageHandlerMethodName = "handle"; // IMPORTANT: Keep this value in sync with QueueMessageHandler.handle method name
export const queueMessageHandlerMethodArgumentCount = 2; // IMPORTANT: Keep this value in sync with QueueMessageHandler.handle method argument count
