import { User } from "@/entities/User";
import { HttpContext } from "tomasjs/core";
import { Endpoint } from "tomasjs/endpoints";
import { inRepository, Repository } from "tomasjs/mikro-orm/mongodb";
import { OkResponse } from "tomasjs/responses/status-codes";
import { injectable } from "tsyringe";

@injectable()
export class ClearUsersEndpoint extends Endpoint {
  constructor(@inRepository(User) private readonly usersRepository: Repository<User>) {
    super();
    this.method("delete").path("/clear");
  }
  async handle(context: HttpContext) {
    const users = await this.usersRepository.findAll();

    for (const user of users) {
      this.usersRepository.remove(user);
    }

    await this.usersRepository.flush();

    return new OkResponse();
  }
}
