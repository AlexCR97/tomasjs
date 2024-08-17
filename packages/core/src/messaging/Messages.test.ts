import "reflect-metadata";
import { ConsoleAppBuilder } from "@/console";
import { MessagingSetup } from "./MessagingSetup";
import { IConsumer } from "./Consumer";
import { Message } from "./Message";
import { IProducer, PRODUCER } from "./Producer";

describe("messaging/Messages", () => {
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
      .setupContainer((container) => {
        container.setup(new MessagingSetup().withConsumer(PING_MESSAGE, new MyConsumer()).build());
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
