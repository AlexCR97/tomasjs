import { ILogger } from "@/logging";
import { Message } from "./Message";
import { IProcessor, PROCESSOR } from "./Processor";
import { IServiceProvider } from "@/dependency-injection";

export const SENDER = "@tomasjs/core/messaging/Sender";

export interface ISender {
  send<TResponse = void>(message: Message): Promise<TResponse>;
}

export class Sender implements ISender {
  constructor(private readonly logger: ILogger, private readonly services: IServiceProvider) {}

  async send<TResponse = void>(message: Message): Promise<TResponse> {
    try {
      this.logger.debug('Processing message of type "{type}": {message}', {
        type: message.type,
        message,
      });

      const processor = this.resolveProcessor<TResponse>(message.type);

      const response = await processor.process(message);

      this.logger.debug('Successfully processed message of type "{type}"', { type: message.type });

      return response;
    } catch (err: unknown) {
      const error = err instanceof Error ? err.message : `${err}`;

      this.logger.error('Failed to process message of type "{type}": {error}', {
        type: message.type,
        error,
      });

      throw err;
    }
  }

  private resolveProcessor<TResponse>(type: string): IProcessor<Message, TResponse> {
    const token = PROCESSOR(type);
    return this.services.lastOrThrow<IProcessor<Message, TResponse>>(token);
  }
}
