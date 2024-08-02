export interface EventHandler<TEvent> {
  handle(event: TEvent): Promise<void>;
}

export function isEventHandler<TEvent>(obj: unknown): obj is EventHandler<TEvent> {
  if (obj === null || obj === undefined) {
    return false;
  }

  const methodName: keyof EventHandler<TEvent> = "handle";
  const methodDeclaration = (obj as any)[methodName];

  return (
    methodDeclaration !== null &&
    methodDeclaration !== undefined &&
    typeof methodDeclaration === "function" &&
    (methodDeclaration as Function).name === methodName &&
    (methodDeclaration as Function).length === 1
  );
}

export const EVENT_HANDLERS = "@tomasjs/core/cqrs/EventHandlers";
