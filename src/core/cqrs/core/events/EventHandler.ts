import { Event } from "./Event";

export abstract class EventHandler<TEvent extends Event> {
  abstract handle(event: TEvent): void | Promise<void>;
}
