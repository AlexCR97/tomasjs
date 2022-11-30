import { EventHandler } from "@/core/cqrs/core/events";
import { UserCreatedEvent } from "@/core/cqrs/users";
import { ILogger, ILoggerProvider, ILoggerProviderToken } from "@/core/logger";
import { inject, injectable } from "tsyringe";

@injectable()
export class UserCreatedEventHandler extends EventHandler<UserCreatedEvent> {
  private readonly logger: ILogger;

  constructor(@inject(ILoggerProviderToken) readonly loggerProvider: ILoggerProvider) {
    super();
    this.logger = this.loggerProvider.createLogger(UserCreatedEventHandler.name);
  }

  handle(event: UserCreatedEvent): void {
    this.logger.info("A user was created!", { event });
  }
}
