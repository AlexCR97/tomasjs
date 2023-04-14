import { injectable, internalContainer } from "tomasjs/container";
import { QueueMessageHandlerMetadata, QueueMessageHandlerToken } from "./metadata";

export function queueMessageHandler(queueName: string) {
  return function <T extends new (...args: any[]) => any>(constructor: T) {
    // @ts-ignore | The "decorate" method does not exist until the "reflect-metadata" package is imported.
    Reflect.decorate([injectable() as ClassDecorator], constructor);
    internalContainer.addClass(constructor, { token: QueueMessageHandlerToken });
    const metadata = new QueueMessageHandlerMetadata(constructor);
    metadata.queueName = queueName;
    return constructor;
  };
}
