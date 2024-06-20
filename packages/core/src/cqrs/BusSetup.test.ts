import "reflect-metadata";
import { ContainerBuilder } from "@/dependency-injection";
import { Bus } from "./Bus";
import { requestHandler } from "./@requestHandler";
import { RequestHandler } from "./RequestHandler";
import { IRequest } from "./IRequest";
import { EventHandler } from "./EventHandler";
import { eventHandler } from "./@eventHandler";
import { BusSetup } from "./BusSetup";

describe("BusSetup", () => {
  it("Can setup Bus", async () => {
    const services = await new ContainerBuilder()
      .setup(new BusSetup().build())
      .buildServiceProvider();

    const bus = services.getOrThrow(Bus);

    expect(bus).toBeInstanceOf(Bus);
  });

  it("Can handle a request", async () => {
    class HelloRequest implements IRequest<string> {
      constructor(readonly name: string) {}
    }

    @requestHandler(HelloRequest)
    class TestRequestHandler implements RequestHandler<HelloRequest, string> {
      handle(request: HelloRequest): Promise<string> {
        return Promise.resolve(`Hello ${request.name}!`);
      }
    }

    const services = await new ContainerBuilder()
      .setup(new BusSetup().addRequestHandlers(TestRequestHandler).build())
      .buildServiceProvider();

    const bus = services.getOrThrow(Bus);

    const result = await bus.send(new HelloRequest("jest"));

    expect(result).toMatch("Hello jest!");
  });

  it("Can handle an event", (done) => {
    class HelloEvent {
      constructor(readonly name: string) {}
    }

    @eventHandler(HelloEvent)
    class HelloEventHandler implements EventHandler<HelloEvent> {
      async handle(event: HelloEvent): Promise<void> {
        expect(event.name).toMatch("jest");
        done();
      }
    }

    (async () => {
      const services = await new ContainerBuilder()
        .setup(new BusSetup().addEventHandlers(HelloEventHandler).build())
        .buildServiceProvider();

      const bus = services.getOrThrow(Bus);

      bus.emit(new HelloEvent("jest"));
    })();
  });
});
