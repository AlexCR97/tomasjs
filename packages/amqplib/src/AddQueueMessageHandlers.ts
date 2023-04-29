import { ClassConstructor, ContainerSetupFactory, ContainerSetupFunction } from "@tomasjs/core";
import { QueueMessageHandlerToken } from "./metadata";

export class AddQueueMessageHandlers implements ContainerSetupFactory {
  constructor(private readonly queueMessageHandlers: ClassConstructor<any>[]) {}

  create(): ContainerSetupFunction {
    return (container) => {
      if (!this.queueMessageHandlers) {
        return;
      }

      if (this.queueMessageHandlers.length === 0) {
        return;
      }

      for (const handler of this.queueMessageHandlers) {
        container.addClass(handler, { token: QueueMessageHandlerToken });
      }
    };
  }
}
