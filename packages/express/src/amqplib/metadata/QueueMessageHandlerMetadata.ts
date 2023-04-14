import { ClassConstructor } from "@/container";
import { QueueMessageHandler } from "../QueueMessageHandler";
import { QueueMessageHandlerMetadataKeys } from "./QueueMessageHandlerMetadataKeys";

export class QueueMessageHandlerMetadata {
  private readonly queueNameKey = QueueMessageHandlerMetadataKeys.queueName;

  constructor(
    private readonly QueueMessageHandler:
      | QueueMessageHandler
      | ClassConstructor<QueueMessageHandler>
  ) {}

  get queueName(): string {
    return Reflect.getMetadata(this.queueNameKey, this.queueMessageHandlerPrototype);
  }
  set queueName(value: string) {
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

    // Considering that the "handle" property must be a named function...
    return (
      func.name.trim() === "handle" && // The name must be "handle"
      func.length === 1 // It must receive 1 argument
    );
  }
}
