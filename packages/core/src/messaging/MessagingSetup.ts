import { EventEmitter } from "node:events";
import { ContainerSetupFunction, IServiceProvider } from "@/dependency-injection";
import { ILogger, ILoggerBuilder, LOGGER_BUILDER, NullLogger } from "@/logging";
import { IConsumer } from "./Consumer";
import { Message } from "./Message";
import { IProducer, PRODUCER, Producer } from "./Producer";

export type MessagingOptions = {
  consumers?: ConsumerOption[];
};

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
  withConsumer<T extends Message>(type: string, consumer: IConsumer<T>): this;
}

export class MessagingSetup implements IMessagingSetup {
  private readonly consumers: ConsumerOption[] = [];

  withConsumer<T extends Message>(type: string, consumer: IConsumer<T>): this {
    this.consumers.push({ type, consumer });
    return this;
  }

  build(): ContainerSetupFunction {
    return messaging({
      consumers: this.consumers,
    });
  }
}
