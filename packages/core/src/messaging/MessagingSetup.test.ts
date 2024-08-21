import "reflect-metadata";
import { ConsoleAppBuilder } from "@/console";
import { IConsumer } from "./Consumer";
import { Message } from "./Message";
import { IProducer, PRODUCER } from "./Producer";
import { ISender, SENDER } from "./Sender";
import { IProcessor } from "./Processor";
import { timeout } from "@/system";
import { ILogger, LOGGER } from "@/logging";
import { inject } from "@/dependency-injection";

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

  it("should produce a message and consume it with multiple function consumers", async () => {
    const EVENT_TYPE = "FunctionEvent";

    class MyEvent implements Message {
      readonly type: string = EVENT_TYPE;

      private _result: string[] = [];

      get result(): readonly string[] {
        return this._result;
      }

      push(item: string) {
        this._result.push(item);
      }
    }

    const app = await new ConsoleAppBuilder()
      .setupMessaging((messaging) => {
        messaging
          .withConsumer<MyEvent>(EVENT_TYPE, ({ services, message }) => {
            const logger = services.getOrThrow<ILogger>(LOGGER);
            message.push("A");
            logger.debug("[ConsumerA] Snapshot: {snapshot}", { snapshot: message.result });
          })
          .withConsumer<MyEvent>(EVENT_TYPE, ({ services, message }) => {
            const logger = services.getOrThrow<ILogger>(LOGGER);
            message.push("B");
            logger.debug("[ConsumerB] Snapshot: {snapshot}", { snapshot: message.result });
          })
          .withConsumer<MyEvent>(EVENT_TYPE, ({ services, message }) => {
            const logger = services.getOrThrow<ILogger>(LOGGER);
            message.push("C");
            logger.debug("[ConsumerC] Snapshot: {snapshot}", { snapshot: message.result });
          })
          .withConsumer<MyEvent>(EVENT_TYPE, ({ message }) => {
            expect(message.result).toMatchObject(["A", "B", "C"]);
          });
      })
      .addEntryPoint(({ services }) => {
        const producer = services.getOrThrow<IProducer>(PRODUCER);
        producer.produce(new MyEvent());
      })
      .build();

    await app.start();
  });

  it("should produce a message and consume it with multiple class consumers", async () => {
    const EVENT_TYPE = "ClassEvent";

    class MyEvent implements Message {
      readonly type: string = EVENT_TYPE;

      private _result: string[] = [];

      get result(): readonly string[] {
        return this._result;
      }

      push(item: string) {
        this._result.push(item);
      }
    }

    class ConsumerA implements IConsumer<MyEvent> {
      consume(message: MyEvent): void {
        message.push("A");
      }
    }

    class ConsumerB implements IConsumer<MyEvent> {
      consume(message: MyEvent): void {
        message.push("B");
      }
    }

    class ConsumerC implements IConsumer<MyEvent> {
      consume(message: MyEvent): void {
        message.push("C");
      }
    }

    class ConsumerD implements IConsumer<MyEvent> {
      consume(message: MyEvent): void {
        expect(message.result).toMatchObject(["A", "B", "C"]);
      }
    }

    const app = await new ConsoleAppBuilder()
      .setupMessaging((messaging) => {
        messaging
          .withConsumer(EVENT_TYPE, new ConsumerA())
          .withConsumer(EVENT_TYPE, new ConsumerB())
          .withConsumer(EVENT_TYPE, new ConsumerC())
          .withConsumer(EVENT_TYPE, new ConsumerD());
      })
      .addEntryPoint(({ services }) => {
        const producer = services.getOrThrow<IProducer>(PRODUCER);
        producer.produce(new MyEvent());
      })
      .build();

    await app.start();
  });

  it("should produce a message and consume it with multiple service consumers", async () => {
    const EVENT_TYPE = "ClassEvent";

    class MyEvent implements Message {
      readonly type: string = EVENT_TYPE;

      private _result: string[] = [];

      get result(): readonly string[] {
        return this._result;
      }

      push(item: string) {
        this._result.push(item);
      }
    }

    class ConsumerA implements IConsumer<MyEvent> {
      constructor(@inject(LOGGER) private readonly logger: ILogger) {}
      consume(message: MyEvent): void {
        message.push("A");
        this.logger.debug("[ConsumerA] Snapshot: {snapshot}", { snapshot: message.result });
      }
    }

    class ConsumerB implements IConsumer<MyEvent> {
      constructor(@inject(LOGGER) private readonly logger: ILogger) {}
      consume(message: MyEvent): void {
        message.push("B");
        this.logger.debug("[ConsumerB] Snapshot: {snapshot}", { snapshot: message.result });
      }
    }

    class ConsumerC implements IConsumer<MyEvent> {
      constructor(@inject(LOGGER) private readonly logger: ILogger) {}
      consume(message: MyEvent): void {
        message.push("C");
        this.logger.debug("[ConsumerC] Snapshot: {snapshot}", { snapshot: message.result });
      }
    }

    class ConsumerD implements IConsumer<MyEvent> {
      consume(message: MyEvent): void {
        expect(message.result).toMatchObject(["A", "B", "C"]);
      }
    }

    const app = await new ConsoleAppBuilder()
      .setupMessaging((messaging) => {
        messaging
          .withConsumer(EVENT_TYPE, ConsumerA)
          .withConsumer(EVENT_TYPE, ConsumerB)
          .withConsumer(EVENT_TYPE, ConsumerC)
          .withConsumer(EVENT_TYPE, ConsumerD);
      })
      .addEntryPoint(({ services }) => {
        const producer = services.getOrThrow<IProducer>(PRODUCER);
        producer.produce(new MyEvent());
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

  it("should process a message using a function", async () => {
    const MESSAGE_TYPE = "FunctionMessage";

    class MyMessage implements Message {
      readonly type: string = MESSAGE_TYPE;
    }

    class MyResponse {}

    const app = await new ConsoleAppBuilder()
      .setupMessaging((messaging) => {
        messaging.withProcessor(MESSAGE_TYPE, async ({ services, message }) => {
          const logger = services.getOrThrow<ILogger>(LOGGER);
          logger.debug("Message type: {type}", { type: message.type });
          return new MyResponse();
        });
      })
      .addEntryPoint(async ({ services }) => {
        const sender = services.getOrThrow<ISender>(SENDER);
        const message = new MyMessage();
        const response = await sender.send(message);
        expect(response).toBeInstanceOf(MyResponse);
      })
      .build();

    await app.start();
  });

  it("should process a message using a class", async () => {
    const MESSAGE_TYPE = "ClassMessage";

    class MyMessage implements Message {
      readonly type: string = MESSAGE_TYPE;
    }

    class MyResponse {}

    class MyProcessor implements IProcessor<MyMessage, MyResponse> {
      async process(message: MyMessage): Promise<MyResponse> {
        return new MyResponse();
      }
    }

    const app = await new ConsoleAppBuilder()
      .setupMessaging((messaging) => {
        messaging.withProcessor(MESSAGE_TYPE, new MyProcessor());
      })
      .addEntryPoint(async ({ services }) => {
        const sender = services.getOrThrow<ISender>(SENDER);
        const message = new MyMessage();
        const response = await sender.send(message);
        expect(response).toBeInstanceOf(MyResponse);
      })
      .build();

    await app.start();
  });

  it("should process a message using a service", async () => {
    const MESSAGE_TYPE = "ServiceMessage";

    class MyMessage implements Message {
      readonly type: string = MESSAGE_TYPE;
    }

    class MyResponse {}

    class MyProcessor implements IProcessor<MyMessage, MyResponse> {
      constructor(@inject(LOGGER) private readonly logger: ILogger) {}

      async process(message: MyMessage): Promise<MyResponse> {
        this.logger.debug("Message type: {type}", { type: message.type });
        return new MyResponse();
      }
    }

    const app = await new ConsoleAppBuilder()
      .setupMessaging((messaging) => {
        messaging.withProcessor(MESSAGE_TYPE, MyProcessor);
      })
      .addEntryPoint(async ({ services }) => {
        const sender = services.getOrThrow<ISender>(SENDER);
        const message = new MyMessage();
        const response = await sender.send(message);
        expect(response).toBeInstanceOf(MyResponse);
      })
      .build();

    await app.start();
  });

  it("should process a message using the last service", async () => {
    const MESSAGE_TYPE = "ServiceMessage";

    class MyMessage implements Message {
      readonly type: string = MESSAGE_TYPE;
    }

    class MyResponse {
      constructor(readonly result: string) {}
    }

    class MyProcessorA implements IProcessor<MyMessage, MyResponse> {
      async process(message: MyMessage): Promise<MyResponse> {
        return new MyResponse("A");
      }
    }

    class MyProcessorB implements IProcessor<MyMessage, MyResponse> {
      async process(message: MyMessage): Promise<MyResponse> {
        return new MyResponse("B");
      }
    }

    const app = await new ConsoleAppBuilder()
      .setupMessaging((messaging) => {
        messaging
          .withProcessor(MESSAGE_TYPE, MyProcessorA)
          .withProcessor(MESSAGE_TYPE, MyProcessorB);
      })
      .addEntryPoint(async ({ services }) => {
        const sender = services.getOrThrow<ISender>(SENDER);
        const message = new MyMessage();
        const response = await sender.send<MyResponse>(message);
        expect(response).toBeInstanceOf(MyResponse);
        expect(response.result).toMatch("B");
      })
      .build();

    await app.start();
  });
});
