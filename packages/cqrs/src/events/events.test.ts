import "reflect-metadata";
import { describe, expect, it } from "@jest/globals";
import { ServiceContainerBuilder, inject } from "@tomasjs/core";
import { eventHandler } from "./@eventHandler";
import { EventDispatcher } from "./EventDispatcher";
import { EventHandler } from "./EventHandler";
import { UseEvents } from "./UseEvents";
import { UseServiceProvider } from "../UseServiceProvider";
import { EventHandlerToken } from "./metadata";

describe("events", () => {
  it(`Can register the ${EventDispatcher.name}`, async () => {
    const services = await new ServiceContainerBuilder()
      .setup(new UseServiceProvider())
      .setup(new UseEvents())
      .buildServiceProviderAsync();

    const eventDispatcher = services.get<EventDispatcher>(EventDispatcher);
    expect(eventDispatcher).toBeInstanceOf(EventDispatcher);
  });

  it("Can register an EventHandler", async () => {
    class TestEvent {}

    //@ts-ignore: Fix decorators not working in test files
    @eventHandler(TestEvent)
    class TestEventHandler implements EventHandler<TestEvent> {
      handle(event: TestEvent) {}
    }

    const services = await new ServiceContainerBuilder()
      .setup(new UseServiceProvider())
      .setup(new UseEvents([TestEventHandler]))
      .buildServiceProviderAsync();

    const eventHandlers = services.getAll<EventHandler<any>>(EventHandlerToken);

    expect(eventHandlers.length).toBe(1);
    expect(eventHandlers[0]).toBeInstanceOf(TestEventHandler);
  });

  it("Can register and use an EventHandler", (done) => {
    class TestEvent {
      constructor() {}
    }

    //@ts-ignore: Fix decorators not working in test files
    @eventHandler(TestEvent)
    class TestEventHandler implements EventHandler<TestEvent> {
      handle(event: TestEvent): void {
        done(); // The test will pass if the event is successfully handled
      }
    }

    new ServiceContainerBuilder()
      .setup(new UseServiceProvider())
      .setup(new UseEvents([TestEventHandler]))
      .buildServiceProviderAsync()
      .then((services) => {
        const eventDispatcher = services.get<EventDispatcher>(EventDispatcher);
        eventDispatcher.emit(new TestEvent());
      });
  });

  it("Can register and use multiple EventHandlers", (done) => {
    class EventA {
      constructor() {}
    }

    //@ts-ignore: Fix decorators not working in test files
    @eventHandler(EventA)
    class EventAHandler implements EventHandler<EventA> {
      constructor(
        //@ts-ignore: Fix decorators not working in test files
        @inject(EventDispatcher) private readonly eventDispatcher: EventDispatcher
      ) {}

      handle(event: EventA): void {
        this.eventDispatcher.emit(new EventB()); // propagate to EventB
      }
    }

    class EventB {
      constructor() {}
    }

    //@ts-ignore: Fix decorators not working in test files
    @eventHandler(EventB)
    class EventBHandler implements EventHandler<EventB> {
      handle(event: EventB): void {
        done(); // The test will pass if the EventB is successfully handled
      }
    }

    new ServiceContainerBuilder()
      .setup(new UseServiceProvider())
      .setup(new UseEvents([EventAHandler, EventBHandler]))
      .buildServiceProviderAsync()
      .then((services) => {
        const eventDispatcher = services.get<EventDispatcher>(EventDispatcher);
        eventDispatcher.emit(new EventA());
      });
  });
});
