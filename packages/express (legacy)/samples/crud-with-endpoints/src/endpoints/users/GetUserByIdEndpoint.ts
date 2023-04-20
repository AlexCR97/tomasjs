import { HttpContext } from "tomasjs/core";
import { endpoint, Endpoint, path } from "tomasjs/endpoints";
import { inRepository, Repository } from "tomasjs/mikro-orm/mongodb";
import { NotFoundResponse } from "tomasjs/responses/status-codes";
import { User } from "@/entities/User";

@endpoint()
@path(":id")
export class GetUserByIdEndpoint implements Endpoint {
  constructor(@inRepository(User) private readonly usersRepository: Repository<User>) {}

  async handle(context: HttpContext) {
    const userId = context.request.params.id;
    const user = await this.usersRepository.findOne({ id: userId });

    if (!user) {
      return new NotFoundResponse();
    }

    return user;
  }
}
