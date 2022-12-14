import { User } from "@/entities/User";
import { HttpContext } from "tomasjs/core";
import { Endpoint } from "tomasjs/endpoints";
import { inRepository, Repository } from "tomasjs/mikro-orm/mongodb";
import { NotFoundResponse } from "tomasjs/responses/status-codes";
import { injectable } from "tsyringe";

@injectable()
export class GetUserByIdEndpoint extends Endpoint {
  constructor(
    @inRepository(User) private readonly usersRepository: Repository<User>
  ) {
    super();
    this.path("/:id");
  }
  async handle(context: HttpContext) {
    const userId = context.request.params.id;
    const user = await this.usersRepository.findOne({ id: userId });

    if (!user) {
      return new NotFoundResponse();
    }

    return user;
  }
}
