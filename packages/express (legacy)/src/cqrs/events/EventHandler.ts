export interface EventHandler<TEvent> {
  handle(event: TEvent): void | Promise<void>;
}
