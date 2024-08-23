import { Constructor, isFunction, isNotNull } from "@/system";
import { Message } from "./Message";
import { IServiceProvider } from "@/dependency-injection";

export const CONSUMER = <T extends string>(type: T) =>
  `@tomasjs/core/messaging/Consumer/${type}` as const;

export type ConsumerType<T extends Message> =
  | ConsumerFunction<T>
  | IConsumer<T>
  | Constructor<IConsumer<T>>;

export type ConsumerFunction<T extends Message> = (
  context: ConsumerContext<T>
) => void | Promise<void>;

export type ConsumerContext<T extends Message> = { services: IServiceProvider; message: T };

export function isConsumerFunction<T extends Message>(obj: unknown): obj is ConsumerFunction<T> {
  return isNotNull(obj) && isFunction(obj) && obj.length === 1;
}

export interface IConsumer<T extends Message> {
  consume(message: T): void | Promise<void>;
}

export function isIConsumer<T extends Message>(obj: unknown): obj is IConsumer<T> {
  return isNotNull(obj) && isConsumerFunction((obj as IConsumer<T>)["consume"]);
}
