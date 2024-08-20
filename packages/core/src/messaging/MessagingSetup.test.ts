import "reflect-metadata";
import { ConsoleAppBuilder } from "@/console";
import { IConsumer } from "./Consumer";
import { Message } from "./Message";
import { IProducer, PRODUCER } from "./Producer";
import { ISender, SENDER } from "./Sender";
import { IProcessor } from "./Processor";
import { timeout } from "@/system";

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
});
