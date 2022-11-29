import { AsyncCommandHandler } from "@/core/cqrs/core/commands";
import { SignUpUserCommand } from "@/core/cqrs/users/SignUpUserCommand";
import { User } from "@/core/entities/User";
import { IUserRepository, IUserRepositoryToken } from "@/infrastructure/data/repositories/users";
import { Mapper } from "@/infrastructure/mapper";
import { inject, injectable } from "tsyringe";

@injectable()
export class SignUpUserCommandHandler extends AsyncCommandHandler<SignUpUserCommand> {
  constructor(@inject(IUserRepositoryToken) readonly userRepository: IUserRepository) {
    super();
  }

  async handleAsync(command: SignUpUserCommand): Promise<void> {
    console.log("command", command);
    const user = Mapper.map(command, SignUpUserCommand, User);
    user.id = command.id;
    console.log("user", user);
    await this.userRepository.createAsync(user);
  }
}
