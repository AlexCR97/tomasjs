import { injectable, internalContainer } from "@/container";
import { QueueMessageHandlerMetadata, QueueMessageHandlerToken } from "./metadata";

export function queueMessageHandler(queueName: string) {
  return function <T extends new (...args: any[]) => any>(constructor: T) {
    Reflect.decorate([injectable() as ClassDecorator], constructor);
    internalContainer.addClass(constructor, { token: QueueMessageHandlerToken });
    const metadata = new QueueMessageHandlerMetadata(constructor);
    metadata.queueName = queueName;
    return constructor;
  };
}
