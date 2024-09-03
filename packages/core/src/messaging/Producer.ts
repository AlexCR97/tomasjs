import { EventEmitter } from "node:events";
import { ILogger } from "@/logging";
import { Message } from "./Message";

export const PRODUCER = "@tomasjs/core/messaging/Producer";

export interface IProducer {
  produce(message: Message): void;
}

export class Producer implements IProducer {
  constructor(private readonly emitter: EventEmitter, private readonly logger: ILogger) {}

  produce(message: Message): void {
    this.emitter.emit(message.type, message);
  }
}
