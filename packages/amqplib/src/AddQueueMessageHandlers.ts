import { ClassConstructor, ContainerSetup, ContainerSetupFactory } from "@tomasjs/core";
import { QueueMessageHandlerToken } from "./metadata";

export class AddQueueMessageHandlers extends ContainerSetupFactory {
  constructor(private readonly queueMessageHandlers: ClassConstructor<any>[]) {
    super();
  }

  create(): ContainerSetup {
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
