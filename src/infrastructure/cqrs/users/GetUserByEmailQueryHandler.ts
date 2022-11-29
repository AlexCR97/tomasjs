import { AsyncQueryHandler } from "@/core/cqrs/core/queries";
import { GetUserByEmailQuery } from "@/core/cqrs/users";
import { User } from "@/core/entities/User";
import { UserModel } from "@/core/models/UserModel";
import { IUserRepository, IUserRepositoryToken } from "@/infrastructure/data/repositories/users";
import { Mapper } from "@/infrastructure/mapper";
import { inject, injectable } from "tsyringe";

@injectable()
export class GetUserByEmailQueryHandler extends AsyncQueryHandler<GetUserByEmailQuery, UserModel> {
  constructor(@inject(IUserRepositoryToken) private readonly userRepository: IUserRepository) {
    super();
  }

  async handleAsync(query: GetUserByEmailQuery): Promise<UserModel> {
    const user = await this.userRepository.getByEmailAsync(query.email);
    return Mapper.map(user, User, UserModel);
  }
}
