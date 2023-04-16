import { ClassConstructor } from "@tomasjs/express/container";
import {
  QueueMessageHandler,
  queueMessageHandlerMethodArgumentCount,
  queueMessageHandlerMethodName,
} from "../QueueMessageHandler";
import { QueueMessageHandlerMetadataKeys } from "./QueueMessageHandlerMetadataKeys";

export class QueueMessageHandlerMetadata {
  private readonly queueNameKey = QueueMessageHandlerMetadataKeys.queueName;

  constructor(
    private readonly QueueMessageHandler:
      | QueueMessageHandler
      | ClassConstructor<QueueMessageHandler>
  ) {}

  get queueName(): string {
    // @ts-ignore | The "getMetadata" method does not exist until the "reflect-metadata" package is imported.
    return Reflect.getMetadata(this.queueNameKey, this.queueMessageHandlerPrototype);
  }
  set queueName(value: string) {
    // @ts-ignore | The "defineMetadata" method does not exist until the "reflect-metadata" package is imported.
    Reflect.defineMetadata(this.queueNameKey, value, this.queueMessageHandlerPrototype);
  }

  private get queueMessageHandlerPrototype() {
    return this.isQueueMessageHandler(this.QueueMessageHandler)
      ? Object.getPrototypeOf(this.QueueMessageHandler)
      : this.QueueMessageHandler.prototype;
  }

  private isQueueMessageHandler(obj: any): obj is QueueMessageHandler {
    if (obj === undefined || obj === null) {
      return false;
    }

    const func = obj.handle as Function;

    if (typeof func !== "function") {
      return false;
    }

    return (
      func.name.trim() === queueMessageHandlerMethodName &&
      func.length === queueMessageHandlerMethodArgumentCount
    );
  }
}
