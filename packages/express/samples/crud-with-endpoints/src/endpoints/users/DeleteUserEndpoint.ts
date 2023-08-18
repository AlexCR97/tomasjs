import { HttpContext } from "tomasjs/core";
import { endpoint, Endpoint, path } from "tomasjs/endpoints";
import { inRepository, Repository } from "tomasjs/mikro-orm/mongodb";
import { NoContentResponse, NotFoundResponse } from "tomasjs/responses/status-codes";
import { User } from "@/entities/User";

@endpoint("delete")
@path(":id")
export class DeleteUserEndpoint implements Endpoint {
  constructor(@inRepository(User) private readonly usersRepository: Repository<User>) {}

  async handle(context: HttpContext) {
    const userId = context.request.params.id;
    const existingUser = await this.usersRepository.findOne({ id: userId });

    if (!existingUser) {
      return new NotFoundResponse();
    }

    await this.usersRepository.removeAndFlush(existingUser);
    return new NoContentResponse();
  }
}
