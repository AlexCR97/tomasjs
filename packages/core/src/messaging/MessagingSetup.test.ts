import "reflect-metadata";
import { ConsoleAppBuilder } from "@/console";
import { IConsumer } from "./Consumer";
import { Message } from "./Message";
import { IProducer, PRODUCER } from "./Producer";
import { ISender, SENDER } from "./Sender";
import { IProcessor } from "./Processor";
import { timeout } from "@/system";
import { ILogger, LOGGER } from "@/logging";

describe("messaging", () => {
  it("should produce a message and consume it", async () => {
    const PING_MESSAGE = "PingEvent";

    class PingMessage implements Message {
      readonly type: string = PING_MESSAGE;
      readonly occurredAt: number = Date.now();
    }

    class MyConsumer implements IConsumer<PingMessage> {
      consume(message: PingMessage): void {
        expect(message.type).toMatch(PING_MESSAGE);
        expect(message.occurredAt).toBeLessThanOrEqual(Date.now());
      }
    }

    const app = await new ConsoleAppBuilder()
      .setupMessaging((messaging) => {
        messaging.withConsumer(PING_MESSAGE, new MyConsumer());
      })
      .addEntryPoint(({ services }) => {
        const producer = services.getOrThrow<IProducer>(PRODUCER);
        const message = new PingMessage();
        producer.produce(message);
      })
      .build();

    await app.start();
  });

  it("should produce a message and consume it with multiple consumers", async () => {
    const COUNT_EVENT = "CountEvent";

    class CountEvent implements Message {
      readonly type: string = COUNT_EVENT;

      private _count = 0;

      get count() {
        return this._count;
      }

      increase() {
        this._count += 1;
      }
    }

    class CountEventConsumerA implements IConsumer<CountEvent> {
      consume(message: CountEvent): void {
        message.increase();
      }
    }

    class CountEventConsumerB implements IConsumer<CountEvent> {
      consume(message: CountEvent): void {
        message.increase();
      }
    }

    const app = await new ConsoleAppBuilder()
      .setupMessaging((messaging) => {
        messaging
          .withConsumer(COUNT_EVENT, new CountEventConsumerA())
          .withConsumer(COUNT_EVENT, new CountEventConsumerB());
      })
      .addEntryPoint(({ services }) => {
        const logger = services.getOrThrow<ILogger>(LOGGER);
        const producer = services.getOrThrow<IProducer>(PRODUCER);
        const message = new CountEvent();
        producer.produce(message);
        logger.debug("Count: {count}", { count: message.count });
        expect(message.count).toBe(2);
      })
      .build();

    await app.start();
  });

  it("should process a message", async () => {
    const PING_MESSAGE = "Ping";

    class Ping implements Message {
      readonly type: string = PING_MESSAGE;
      readonly requestedAt: number = Date.now();
    }

    let pinged = false;
    class PingProcessor implements IProcessor<Ping> {
      async process(message: Ping): Promise<void> {
        pinged = true;
      }
    }

    const app = await new ConsoleAppBuilder()
      .setupMessaging((messaging) => {
        messaging.withProcessor(PING_MESSAGE, new PingProcessor());
      })
      .addEntryPoint(async ({ services }) => {
        const sender = services.getOrThrow<ISender>(SENDER);
        const message = new Ping();

        const response = await sender.send(message);
        expect(response).toBeUndefined();

        expect(pinged).toBe(true);
      })
      .build();

    await app.start();
  });

  it("should process a message and receive a response", async () => {
    const PING_MESSAGE = "PingPong";

    class Ping implements Message {
      readonly type: string = PING_MESSAGE;
      readonly requestedAt: number = Date.now();
    }

    class Pong {
      readonly respondedAt: number = Date.now();
      constructor(readonly pingedAt: number) {}
    }

    class PingProcessor implements IProcessor<Ping, Pong> {
      async process(message: Ping): Promise<Pong> {
        return new Pong(message.requestedAt);
      }
    }

    const app = await new ConsoleAppBuilder()
      .setupMessaging((messaging) => {
        messaging.withProcessor(PING_MESSAGE, new PingProcessor());
      })
      .addEntryPoint(async ({ services }) => {
        const sender = services.getOrThrow<ISender>(SENDER);
        const message = new Ping();

        await timeout(100); // Make time so the "respondedAt" field makes sense

        const response = await sender.send<Pong>(message);
        expect(response.pingedAt).toBe(message.requestedAt);
        expect(response.respondedAt).toBeGreaterThan(response.pingedAt);
      })
      .build();

    await app.start();
  });

  it("should process a message with the last registered processor", async () => {
    const MESSAGE_TYPE = "MessageType";

    class MyMessage implements Message {
      readonly type: string = MESSAGE_TYPE;
    }

    class MyMessageProcessorA implements IProcessor<MyMessage, string> {
      async process(message: MyMessage): Promise<string> {
        return "A";
      }
    }

    class MyMessageProcessorB implements IProcessor<MyMessage, string> {
      async process(message: MyMessage): Promise<string> {
        return "B";
      }
    }

    const app = await new ConsoleAppBuilder()
      .setupMessaging((messaging) => {
        messaging
          .withProcessor(MESSAGE_TYPE, new MyMessageProcessorA())
          .withProcessor(MESSAGE_TYPE, new MyMessageProcessorB());
      })
      .addEntryPoint(async ({ services }) => {
        const sender = services.getOrThrow<ISender>(SENDER);
        const message = new MyMessage();
        const response = await sender.send<string>(message);
        expect(response).toBe("B");
      })
      .build();

    await app.start();
  });
});
