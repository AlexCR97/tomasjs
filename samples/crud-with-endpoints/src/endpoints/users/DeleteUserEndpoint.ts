import { User } from "@/entities/User";
import { HttpContext } from "tomasjs/core";
import { Endpoint } from "tomasjs/endpoints";
import { inRepository, Repository } from "tomasjs/mikro-orm/mongodb";
import { NoContentResponse, NotFoundResponse } from "tomasjs/responses/status-codes";
import { injectable } from "tsyringe";

@injectable()
export class DeleteUserEndpoint extends Endpoint {
  constructor(
    @inRepository(User) private readonly usersRepository: Repository<User>
  ) {
    super();
    this.method("delete").path("/:id");
  }
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
