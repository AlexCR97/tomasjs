import { AsyncCommandHandler } from "@/core/cqrs/core/commands";
import { EventDispatcher } from "@/core/cqrs/core/events";
import { UserCreatedEvent } from "@/core/cqrs/users";
import { SignUpUserCommand } from "@/core/cqrs/users/SignUpUserCommand";
import { User } from "@/core/entities/User";
import { IUserRepository, IUserRepositoryToken } from "@/infrastructure/data/repositories/users";
import { Mapper } from "@/infrastructure/mapper";
import { inject, injectable } from "tsyringe";

@injectable()
export class SignUpUserCommandHandler extends AsyncCommandHandler<SignUpUserCommand> {
  constructor(
    @inject(IUserRepositoryToken) readonly userRepository: IUserRepository,
    @inject(EventDispatcher) readonly eventDispatcher: EventDispatcher
  ) {
    super();
  }

  async handleAsync(command: SignUpUserCommand): Promise<void> {
    // Create user
    const user = Mapper.map(command, SignUpUserCommand, User);
    user.id = command.id;
    await this.userRepository.createAsync(user);

    // Dispatch event
    const event = Mapper.map(user, User, UserCreatedEvent);
    event.id = user.id;
    this.eventDispatcher.dispatch(event);
  }
}
