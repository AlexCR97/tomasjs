import "reflect-metadata";
import { ConsoleAppBuilder } from "@/console";
import { IConsumer } from "./Consumer";
import { Message } from "./Message";
import { IProducer, PRODUCER } from "./Producer";

describe("messaging", () => {
  it("should produce and consume a message", async () => {
    const PING_MESSAGE = "ping";

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
});
