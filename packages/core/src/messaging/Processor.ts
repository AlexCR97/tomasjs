import { IServiceProvider } from "@/dependency-injection";
import { Constructor, isFunction, isNotNull } from "@/system";
import { Message } from "./Message";

export const PROCESSOR = <T extends string>(type: T) =>
  `@tomasjs/core/messaging/Processor/${type}` as const;

export type ProcessorType<TMessage extends Message, TResponse> =
  | ProcessorFunction<TMessage, TResponse>
  | IProcessor<TMessage, TResponse>
  | Constructor<IProcessor<TMessage, TResponse>>;

export type ProcessorFunction<TMessage extends Message, TResponse = void> = (
  context: ProcessorContext<TMessage>
) => Promise<TResponse>;

export type ProcessorContext<TMessage extends Message> = {
  services: IServiceProvider;
  message: TMessage;
};

export function isProcessorFunction<TMessage extends Message, TResponse>(
  obj: unknown
): obj is ProcessorFunction<TMessage, TResponse> {
  return isNotNull(obj) && isFunction(obj) && obj.length === 1;
}

export interface IProcessor<TMessage extends Message, TResponse = void> {
  process(message: TMessage): Promise<TResponse>;
}

export function isIProcessor<TMessage extends Message, TResponse>(
  obj: unknown
): obj is IProcessor<TMessage, TResponse> {
  return isNotNull(obj) && isProcessorFunction((obj as IProcessor<TMessage, TResponse>)["process"]);
}
