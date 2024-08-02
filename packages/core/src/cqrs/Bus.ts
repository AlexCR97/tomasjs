import { inject } from "@/dependency-injection";
import { REQUEST_HANDLERS, RequestHandler } from "./RequestHandler";
import { EVENT_HANDLERS, EventHandler } from "./EventHandler";
import { constructorOf } from "../system/constructorOf";
import { Constructor } from "@/system";
import { RequestHandlerMetadata } from "./@requestHandler";
import { TomasError } from "@/errors";
import { IRequest } from "./IRequest";
import { EventHandlerMetadata } from "./@eventHandler";

interface IBus {
  send<TRequest extends IRequest<TResult>, TResult>(request: TRequest): Promise<TResult>;
  emit<TEvent>(event: TEvent): void;
}

export class Bus implements IBus {
  constructor(
    @inject(REQUEST_HANDLERS, { multiple: true })
    private readonly requestHandlers: readonly RequestHandler<any, any>[],

    @inject(EVENT_HANDLERS, { multiple: true })
    private readonly eventHandlers: readonly EventHandler<any>[]
  ) {}

  async send<TRequest extends IRequest<TResult>, TResult>(request: TRequest): Promise<TResult> {
    const requestConstructor = constructorOf<TRequest>(request);
    const requestHandler = this.getRequestHandlerFor<TRequest, TResult>(requestConstructor);
    return await requestHandler.handle(request);
  }

  private getRequestHandlerFor<TRequest extends IRequest<TResult>, TResult>(
    requestConstructor: Constructor<TRequest>
  ): RequestHandler<TRequest, TResult> {
    const matchingHandler = this.requestHandlers.find((rh) => {
      const metadata = new RequestHandlerMetadata(rh);
      return metadata.requestConstructor === requestConstructor;
    });

    if (matchingHandler === undefined) {
      throw new TomasError(
        "core/cqrs/RequestHandlerNotFound",
        "Could not find a RequestHandler for the dispatched request.",
        {
          data: { requestConstructor },
        }
      );
    }

    return matchingHandler;
  }

  emit<TEvent>(event: TEvent): void {
    const eventConstructor = constructorOf<TEvent>(event);
    const eventHandler: EventHandler<TEvent> = this.getEventHandlerFor<TEvent>(eventConstructor);
    eventHandler.handle(event); // Do not await. Events must be handled on another process
  }

  private getEventHandlerFor<TEvent>(eventConstructor: Constructor<TEvent>): EventHandler<TEvent> {
    const matchingHandler = this.eventHandlers.find((rh) => {
      const metadata = new EventHandlerMetadata(rh);
      return metadata.eventConstructor === eventConstructor;
    });

    if (matchingHandler === undefined) {
      throw new TomasError(
        "core/cqrs/EventHandlerNotFound",
        "Could not find an EventHandler for the emitted event.",
        {
          data: { eventConstructor },
        }
      );
    }

    return matchingHandler;
  }
}
