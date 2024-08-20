import { Message } from "./Message";

export const PROCESSOR = (type: string): string => `@tomasjs/core/messaging/Processor/${type}`;

export interface IProcessor<TMessage extends Message, TResponse = void> {
  process(message: TMessage): Promise<TResponse>;
}
