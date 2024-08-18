import { EventEmitter } from "node:events";
import { ContainerSetupFunction, IServiceProvider } from "@/dependency-injection";
import { ILogger, ILoggerBuilder, LOGGER_BUILDER, NullLogger } from "@/logging";
import { IConsumer } from "./Consumer";
import { Message } from "./Message";
import { IProducer, PRODUCER, Producer } from "./Producer";
import { IProcessor, PROCESSOR } from "./Processor";
import { ISender, Sender, SENDER } from "./Sender";

export type MessagingOptions = {
  processors?: ProcessorOption[];
  consumers?: ConsumerOption[];
};

export type ProcessorOption = { type: string; processor: IProcessor<Message, unknown> };

export type ConsumerOption = { type: string; consumer: IConsumer<Message> };

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
      for (const { type, processor } of options.processors) {
        container.add("scoped", PROCESSOR(type), processor);
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
        for (const { type, consumer } of options.consumers) {
          registerConsumer({ emitter, logger, type, consumer });
        }
      }

      return emitter;

      function registerConsumer(options: {
        emitter: EventEmitter;
        logger: ILogger;
        type: string;
        consumer: IConsumer<Message>;
      }) {
        const { emitter, logger, type, consumer } = options;

        emitter.on(type, async (message) => {
          try {
            logger.debug('Consuming message of type "{type}": {message}', { type, message });

            await consumer.consume(message);

            logger.debug('Successfully consumed message of type "{type}"', { type });
          } catch (err: unknown) {
            const error = err instanceof Error ? err.message : `${err}`;

            logger.error('Failed to consume message of type "{type}": {error}', {
              type,
              error,
            });
          }
        });
      }
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
    processor: IProcessor<TMessage, TResponse>
  ): this;

  withConsumer<T extends Message>(type: string, consumer: IConsumer<T>): this;
}

export class MessagingSetup implements IMessagingSetup {
  private readonly processors: ProcessorOption[] = [];
  private readonly consumers: ConsumerOption[] = [];

  withProcessor<TMessage extends Message, TResponse>(
    type: string,
    processor: IProcessor<TMessage, TResponse>
  ): this {
    this.processors.push({ type, processor });
    return this;
  }

  withConsumer<T extends Message>(type: string, consumer: IConsumer<T>): this {
    this.consumers.push({ type, consumer });
    return this;
  }

  build(): ContainerSetupFunction {
    return messaging({
      processors: this.processors,
      consumers: this.consumers,
    });
  }
}
