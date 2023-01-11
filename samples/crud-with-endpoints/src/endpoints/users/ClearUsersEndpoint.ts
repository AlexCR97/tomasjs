import { HttpContext } from "tomasjs/core";
import { endpoint, Endpoint, path } from "tomasjs/endpoints";
import { inRepository, Repository } from "tomasjs/mikro-orm/mongodb";
import { OkResponse } from "tomasjs/responses/status-codes";
import { User } from "@/entities/User";

@endpoint("delete")
@path("clear")
export class ClearUsersEndpoint implements Endpoint {
  constructor(@inRepository(User) private readonly usersRepository: Repository<User>) {}

  async handle(context: HttpContext) {
    const users = await this.usersRepository.findAll();

    for (const user of users) {
      this.usersRepository.remove(user);
    }

    await this.usersRepository.flush();

    return new OkResponse();
  }
}
