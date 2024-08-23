import { EventEmitter } from "node:events";
import { ContainerSetupFunction, IServiceProvider } from "@/dependency-injection";
import { ILogger, ILoggerBuilder, LOGGER_BUILDER, NullLogger } from "@/logging";
import {
  CONSUMER,
  ConsumerFunction,
  ConsumerType,
  IConsumer,
  isConsumerFunction,
  isIConsumer,
} from "./Consumer";
import { Message } from "./Message";
import { IProducer, PRODUCER, Producer } from "./Producer";
import {
  IProcessor,
  isIProcessor,
  isProcessorFunction,
  PROCESSOR,
  ProcessorFunction,
  ProcessorType,
} from "./Processor";
import { ISender, Sender, SENDER } from "./Sender";
import { isConstructor } from "@/system";
import { groupBy } from "@/system/groupBy";
import { tick } from "@/system/tick";

export type MessagingOptions = {
  processors?: ProcessorOption[];
  consumers?: ConsumerOption[];
};

export type ProcessorOption = { type: string; processor: ProcessorType<Message, unknown> };

export type ConsumerOption = { type: string; consumer: ConsumerType<Message> };

export function messaging(options?: MessagingOptions): ContainerSetupFunction {
  return (container) => {
    const MESSAGING_LOGGER = "@tomasjs/core/messaging/MessagingLogger";
    const EVENT_EMITTER = "@tomasjs/core/messaging/EventEmitter";

    container.add<ILogger>("singleton", MESSAGING_LOGGER, (services: IServiceProvider) => {
      const loggerBuilder = services.get<ILoggerBuilder>(LOGGER_BUILDER);

      if (loggerBuilder === undefined || loggerBuilder === null) {
        return new NullLogger();
      }

      return loggerBuilder.withCategory(MESSAGING_LOGGER).build();
    });

    if (options && options.processors && options.processors.length > 0) {
      const PROCESSOR_CONSTRUCTOR = <T extends string>(type: T) =>
        `${PROCESSOR(type)}/Constructor` as const;

      for (const { type, processor } of options.processors) {
        if (isConstructor(processor)) {
          container.add("scoped", PROCESSOR_CONSTRUCTOR(type), processor);
        }

        container.add<IProcessor<Message, unknown>>(
          "scoped",
          PROCESSOR(type),
          (services: IServiceProvider) => {
            if (isConstructor(processor)) {
              return services.lastOrThrow<IProcessor<Message, unknown>>(
                PROCESSOR_CONSTRUCTOR(type)
              );
            }

            if (isIProcessor(processor)) {
              return processor;
            }

            if (isProcessorFunction(processor)) {
              class ProcessorDelegate implements IProcessor<Message, unknown> {
                constructor(private readonly processor: ProcessorFunction<Message, unknown>) {}
                process(message: Message): Promise<unknown> {
                  return this.processor({ services, message });
                }
              }

              return new ProcessorDelegate(processor);
            }

            throw new TypeError(`Unknown processor type: ${processor}`);
          }
        );
      }
    }

    container.add<ISender>("singleton", SENDER, (services: IServiceProvider) => {
      const logger = services.getOrThrow<ILogger>(MESSAGING_LOGGER);
      return new Sender(logger, services);
    });

    container.add<EventEmitter>("singleton", EVENT_EMITTER, (services: IServiceProvider) => {
      const emitter = new EventEmitter();
      const logger = services.getOrThrow<ILogger>(MESSAGING_LOGGER);

      if (options?.consumers && options.consumers.length > 0) {
        const CONSUMER_CONSTRUCTOR = <T extends string>(type: T) =>
          `${CONSUMER(type)}/Constructor` as const;

        const consumerOptionsByType = groupBy(options.consumers, "type");
        const messageTypes = Object.keys(consumerOptionsByType);

        for (const type of messageTypes) {
          const consumerOptions = consumerOptionsByType[type];
          const consumerTypes = consumerOptions.map((x) => x.consumer);

          for (const consumer of consumerTypes) {
            if (isConstructor(consumer)) {
              container.add("scoped", CONSUMER_CONSTRUCTOR(type), consumer);
            }

            container.add<IConsumer<Message>>(
              "scoped",
              CONSUMER(type),
              (services: IServiceProvider) => {
                if (isConstructor(consumer)) {
                  return services.getOrThrow<IConsumer<Message>>(CONSUMER_CONSTRUCTOR(type));
                }

                if (isIConsumer(consumer)) {
                  return consumer;
                }

                if (isConsumerFunction(consumer)) {
                  class ConsumerDelegate implements IConsumer<Message> {
                    constructor(private readonly consumer: ConsumerFunction<Message>) {}
                    async consume(message: Message): Promise<void> {
                      await this.consumer({ services, message });
                    }
                  }

                  return new ConsumerDelegate(consumer);
                }

                throw new TypeError(`Unknown consumer type: ${consumer}`);
              }
            );
          }

          emitter.on(type, async (message) => {
            // NOTE: Purposefully wait until the next tick in the event loop.
            // This way, all events are consumed asynchronously after being produced.
            await tick();

            const consumers = services.find<IConsumer<Message>>(CONSUMER(type));

            logger.debug('Found {count} consumers for message of type "{type}"', {
              count: consumers.length,
              type,
            });

            for (const consumer of consumers) {
              try {
                logger.debug('Consuming message of type "{type}": {message}', {
                  type,
                  message,
                });

                await consumer.consume(message);

                logger.debug('Successfully consumed message of type "{type}"', { type });
              } catch (err: unknown) {
                const error = err instanceof Error ? err.message : `${err}`;

                logger.error('Failed to consume message of type "{type}": {error}', {
                  type,
                  error,
                });
              }
            }
          });
        }
      }

      return emitter;
    });

    container.add<IProducer>("singleton", PRODUCER, (services: IServiceProvider) => {
      const emitter = services.getOrThrow<EventEmitter>(EVENT_EMITTER);
      const logger = services.getOrThrow<ILogger>(MESSAGING_LOGGER);
      return new Producer(emitter, logger);
    });
  };
}

export interface IMessagingSetup {
  withProcessor<TMessage extends Message, TResponse>(
    type: string,
    processor: ProcessorType<TMessage, TResponse>
  ): this;

  withConsumer<T extends Message>(type: string, consumer: ConsumerType<T>): this;
}

export class MessagingSetup implements IMessagingSetup {
  private readonly processors: ProcessorOption[] = [];
  private readonly consumers: ConsumerOption[] = [];

  withProcessor<TMessage extends Message, TResponse>(
    type: string,
    processor: ProcessorType<TMessage, TResponse>
  ): this {
    this.processors.push({ type, processor: processor as ProcessorType<Message, unknown> });
    return this;
  }

  withConsumer<T extends Message>(type: string, consumer: ConsumerType<T>): this {
    this.consumers.push({ type, consumer: consumer as ConsumerType<Message> });
    return this;
  }

  build(): ContainerSetupFunction {
    return messaging({
      processors: this.processors,
      consumers: this.consumers,
    });
  }
}
