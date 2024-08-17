import { Message } from "./Message";

export interface IConsumer<T extends Message> {
  consume(message: T): void | Promise<void>;
}
